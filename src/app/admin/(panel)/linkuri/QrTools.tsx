"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { qrSvg } from "@/lib/qr";
import admin from "../../admin.module.css";

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadSvg(url: string, name: string) {
  save(new Blob([qrSvg(url)], { type: "image/svg+xml" }), `qr-${name}.svg`);
}

function downloadPng(url: string, name: string) {
  const size = 1200;
  const image = new Image();
  const source = URL.createObjectURL(new Blob([qrSvg(url, size)], { type: "image/svg+xml" }));
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, size, size);
    URL.revokeObjectURL(source);
    canvas.toBlob((blob) => blob && save(blob, `qr-${name}.png`), "image/png");
  };
  image.src = source;
}

export function CopyButton({ text, label = "Copiază" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`${admin.secondary} ${admin.small}`}
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        })
      }
    >
      {copied ? <Check aria-hidden size={14} /> : <Copy aria-hidden size={14} />} {copied ? "Copiat" : label}
    </button>
  );
}

export function QrDownloads({ url, name }: { url: string; name: string }) {
  const file = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "link";
  return (
    <>
      <button type="button" className={`${admin.secondary} ${admin.small}`} onClick={() => downloadPng(url, file)}>
        <Download aria-hidden size={14} /> PNG
      </button>
      <button type="button" className={`${admin.secondary} ${admin.small}`} onClick={() => downloadSvg(url, file)}>
        <Download aria-hidden size={14} /> SVG
      </button>
    </>
  );
}
