// QR code encoder: byte mode, error correction level M, versions 1-40.
// Follows ISO/IEC 18004 the way Project Nayuki's reference implementation does, without the
// optional finder-lookalike penalty when picking the mask (any mask is valid for scanners).

const ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
const BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];
const FORMAT_BITS_M = 0;

const bit = (value: number, i: number) => ((value >>> i) & 1) !== 0;

function rawModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2;
    result -= (25 * align - 10) * align - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

const dataCodewords = (version: number) => Math.floor(rawModules(version) / 8) - ECC_PER_BLOCK[version] * BLOCKS[version];

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function rsRemainder(data: number[], divisor: number[]): number[] {
  const result = divisor.map(() => 0);
  for (const byte of data) {
    const factor = byte ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => (result[i] ^= gfMultiply(coef, factor)));
  }
  return result;
}

function encodeData(bytes: Uint8Array): { version: number; codewords: number[] } {
  let version = 1;
  for (; version <= 40; version++) {
    const countBits = version <= 9 ? 8 : 16;
    if (4 + countBits + bytes.length * 8 <= dataCodewords(version) * 8) break;
  }
  if (version > 40) throw new Error("Text too long for a QR code");

  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, version <= 9 ? 8 : 16);
  bytes.forEach((b) => push(b, 8));

  const capacity = dataCodewords(version) * 8;
  push(0, Math.min(4, capacity - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  return { version, codewords: interleave(version, data) };
}

function interleave(version: number, data: number[]): number[] {
  const blockCount = BLOCKS[version];
  const eccLen = ECC_PER_BLOCK[version];
  const raw = Math.floor(rawModules(version) / 8);
  const shortBlocks = blockCount - (raw % blockCount);
  const shortLen = Math.floor(raw / blockCount);
  const divisor = rsDivisor(eccLen);

  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < blockCount; i++) {
    const chunk = data.slice(k, k + shortLen - eccLen + (i < shortBlocks ? 0 : 1));
    k += chunk.length;
    const ecc = rsRemainder(chunk, divisor);
    if (i < shortBlocks) chunk.push(0);
    blocks.push([...chunk, ...ecc]);
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortLen - eccLen || j >= shortBlocks) result.push(block[i]);
    });
  }
  return result;
}

function alignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const step = Math.floor((version * 8 + count * 3 + 5) / (count * 4 - 4)) * 2;
  const result = [6];
  for (let pos = version * 4 + 10; result.length < count; pos -= step) result.splice(1, 0, pos);
  return result;
}

const MASKS: ((x: number, y: number) => boolean)[] = [
  (x, y) => (x + y) % 2 === 0,
  (_, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

class Grid {
  readonly modules: boolean[][];
  readonly reserved: boolean[][];
  readonly version: number;

  constructor(version: number) {
    this.version = version;
    const size = version * 4 + 17;
    this.modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    this.reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  }

  get size() {
    return this.modules.length;
  }

  fixed(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark;
    this.reserved[y][x] = true;
  }

  drawFunctionPatterns() {
    const { size } = this;
    for (let i = 0; i < size; i++) {
      this.fixed(6, i, i % 2 === 0);
      this.fixed(i, 6, i % 2 === 0);
    }
    for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          if (x >= 0 && x < size && y >= 0 && y < size) this.fixed(x, y, dist !== 2 && dist !== 4);
        }
      }
    }
    const positions = alignmentPositions(this.version);
    const last = positions.length - 1;
    positions.forEach((px, i) =>
      positions.forEach((py, j) => {
        if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) this.fixed(px + dx, py + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }),
    );
    this.drawFormat(0);
    this.drawVersion();
  }

  drawFormat(mask: number) {
    const data = (FORMAT_BITS_M << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const { size } = this;

    for (let i = 0; i <= 5; i++) this.fixed(8, i, bit(bits, i));
    this.fixed(8, 7, bit(bits, 6));
    this.fixed(8, 8, bit(bits, 7));
    this.fixed(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i++) this.fixed(14 - i, 8, bit(bits, i));
    for (let i = 0; i < 8; i++) this.fixed(size - 1 - i, 8, bit(bits, i));
    for (let i = 8; i < 15; i++) this.fixed(8, size - 15 + i, bit(bits, i));
    this.fixed(8, size - 8, true);
  }

  drawVersion() {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.fixed(a, b, bit(bits, i));
      this.fixed(b, a, bit(bits, i));
    }
  }

  drawCodewords(codewords: number[]) {
    const { size } = this;
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!this.reserved[y][x] && i < codewords.length * 8) {
            this.modules[y][x] = bit(codewords[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  applyMask(mask: number) {
    this.modules.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (!this.reserved[y][x] && MASKS[mask](x, y)) row[x] = !dark;
      }),
    );
  }

  penalty(): number {
    const { size, modules } = this;
    let score = 0;
    const runs = (get: (a: number, b: number) => boolean) => {
      for (let a = 0; a < size; a++) {
        let run = 1;
        for (let b = 1; b <= size; b++) {
          if (b < size && get(a, b) === get(a, b - 1)) run++;
          else {
            if (run >= 5) score += run - 2;
            run = 1;
          }
        }
      }
    };
    runs((y, x) => modules[y][x]);
    runs((x, y) => modules[y][x]);
    let dark = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (modules[y][x]) dark++;
        if (x < size - 1 && y < size - 1) {
          const c = modules[y][x];
          if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) score += 3;
        }
      }
    }
    const total = size * size;
    score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return score;
  }
}

/** Returns the QR matrix for `text` (true = dark), without the quiet zone. */
export function qrMatrix(text: string): boolean[][] {
  const { version, codewords } = encodeData(new TextEncoder().encode(text));
  const grid = new Grid(version);
  grid.drawFunctionPatterns();
  grid.drawCodewords(codewords);

  let best = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    grid.applyMask(mask);
    grid.drawFormat(mask);
    const score = grid.penalty();
    if (score < bestScore) {
      best = mask;
      bestScore = score;
    }
    grid.applyMask(mask);
  }
  grid.applyMask(best);
  grid.drawFormat(best);
  return grid.modules;
}

const QUIET = 4;

/** One SVG path for all dark modules, in a coordinate space of `size` units including the quiet zone. */
export function qrPath(matrix: boolean[][]): { d: string; size: number } {
  const parts: string[] = [];
  matrix.forEach((row, y) =>
    row.forEach((dark, x) => {
      if (dark) parts.push(`M${x + QUIET} ${y + QUIET}h1v1h-1z`);
    }),
  );
  return { d: parts.join(""), size: matrix.length + QUIET * 2 };
}

export function qrSvg(text: string, pixels = 512): string {
  const { d, size } = qrPath(qrMatrix(text));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${pixels}" height="${pixels}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#0f2742"/></svg>`;
}
