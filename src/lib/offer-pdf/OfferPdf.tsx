import { readFileSync } from "node:fs";
import path from "node:path";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { Offer } from "@/lib/db";
import { formatLeiExact, offerTotals, validUntil, VAT_MODES, type OfferItem, type OfferSettings } from "@/lib/offers";
import { company } from "@/lib/site";

// path.join(process.cwd(), "...") with literal segments lets Vercel's file tracing ship these files with the function.
const fontDir = path.join(process.cwd(), "src/lib/offer-pdf/fonts");
// react-pdf cannot draw SVG: this is public/img/daiamar-logo.svg (LOGO in lib/images.ts) rendered once to a 1800 px PNG.
// Passed as bytes: a Windows drive path ("C:\...") is taken for a URL and the image silently does not load.
const logo = { data: readFileSync(path.join(process.cwd(), "src/lib/offer-pdf/daiamar-logo.png")), format: "png" as const };

Font.register({
  family: "Inter Tight",
  fonts: [
    { src: path.join(fontDir, "InterTight-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "InterTight-SemiBold.ttf"), fontWeight: 600 },
    { src: path.join(fontDir, "InterTight-Bold.ttf"), fontWeight: 700 },
  ],
});
// Normal Romanian words are never hyphenated. A run longer than any real word (a URL, a code pasted into a description)
// is cut into pieces the line breaker may split at, so it cannot spill over the price columns or off the page.
const LONGEST_WORD = 24;
Font.registerHyphenationCallback((word) => (word.length <= LONGEST_WORD ? [word] : word.match(/.{1,16}/g) ?? [word]));

const BRAND = "#245482";
const NAVY = "#0F2742";
const MUTED = "#5B6676";
const LINE = "#E3E8EF";
const TINT = "#E9F1F9";

const s = StyleSheet.create({
  page: { fontFamily: "Inter Tight", fontSize: 9.5, color: NAVY, paddingTop: 40, paddingBottom: 64, paddingHorizontal: 44, lineHeight: 1.45 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: BRAND },
  logo: { width: 170, height: 41 },
  headRight: { alignItems: "flex-end" },
  kicker: { fontSize: 8, fontWeight: 600, color: BRAND, letterSpacing: 1.2 },
  number: { fontSize: 18, fontWeight: 700, marginTop: 2, marginBottom: 4, lineHeight: 1.2 },
  muted: { color: MUTED },
  parties: { flexDirection: "row", gap: 16, marginTop: 20 },
  party: { flex: 1, padding: 12, backgroundColor: "#F5F7FA", borderRadius: 6 },
  label: { fontSize: 7.5, fontWeight: 600, color: MUTED, letterSpacing: 0.8, marginBottom: 4 },
  strong: { fontWeight: 600 },
  intro: { marginTop: 18 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 10.5, fontWeight: 700, marginBottom: 6 },
  tableHead: { flexDirection: "row", backgroundColor: NAVY, color: "#FFFFFF", fontSize: 8, fontWeight: 600, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4 },
  row: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: LINE },
  cService: { flex: 1, paddingRight: 8 },
  cQty: { width: 44, textAlign: "right" },
  cUnit: { width: 56, textAlign: "right" },
  cPrice: { width: 78, textAlign: "right" },
  cValue: { width: 84, textAlign: "right" },
  description: { fontSize: 8.5, color: MUTED, marginTop: 1 },
  totals: { marginTop: 18, flexDirection: "row", gap: 12 },
  totalBox: { flex: 1, borderWidth: 1, borderColor: LINE, borderRadius: 6, padding: 10 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grand: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: LINE, fontWeight: 700, fontSize: 11, color: BRAND },
  validity: { marginTop: 18, padding: 10, backgroundColor: TINT, borderRadius: 6, color: BRAND, fontWeight: 600 },
  block: { marginTop: 12 },
  footer: { position: "absolute", left: 44, right: 44, bottom: 26, flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: LINE, fontSize: 7.5, color: MUTED },
  footerText: { flex: 1, paddingRight: 12 },
});

const date = (value: Date | string) => new Intl.DateTimeFormat("ro-RO", { timeZone: "Europe/Bucharest", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
const price = (value: number | null) => (value === null ? "de completat" : formatLeiExact(value));

function Items({ title, items }: { title: string; items: OfferItem[] }) {
  if (!items.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle} minPresenceAhead={60}>{title}</Text>
      <View style={s.tableHead}>
        <Text style={s.cService}>Serviciu</Text>
        <Text style={s.cQty}>Cant.</Text>
        <Text style={s.cUnit}>U.M.</Text>
        <Text style={s.cPrice}>Preț unitar</Text>
        <Text style={s.cValue}>Valoare</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={s.row} wrap={false}>
          <View style={s.cService}>
            <Text style={s.strong}>{item.title}</Text>
            {item.description ? <Text style={s.description}>{item.description}</Text> : null}
          </View>
          <Text style={s.cQty}>{item.quantity}</Text>
          <Text style={s.cUnit}>{item.unit}</Text>
          <Text style={s.cPrice}>{price(item.price)}</Text>
          <Text style={s.cValue}>{item.price === null ? "-" : formatLeiExact(item.price * item.quantity)}</Text>
        </View>
      ))}
    </View>
  );
}

function TotalBox(props: { title: string; gross: number; discount: number; percent: number; vat: number; total: number; vatMode: keyof typeof VAT_MODES; rate: number; suffix: string }) {
  const { title, gross, discount, percent, vat, total, vatMode, rate, suffix } = props;
  return (
    <View style={s.totalBox}>
      <Text style={s.label}>{title.toUpperCase()}</Text>
      <View style={s.totalLine}><Text>Subtotal</Text><Text>{formatLeiExact(gross)}</Text></View>
      {discount > 0 && <View style={s.totalLine}><Text>Discount {percent}%</Text><Text>-{formatLeiExact(discount)}</Text></View>}
      {vatMode === "plus" && <View style={s.totalLine}><Text>TVA {rate}%</Text><Text>{formatLeiExact(vat)}</Text></View>}
      {vatMode === "inclus" && <View style={s.totalLine}><Text style={s.muted}>din care TVA {rate}%</Text><Text style={s.muted}>{formatLeiExact(vat)}</Text></View>}
      <View style={s.grand}><Text>Total</Text><Text>{formatLeiExact(total)}{suffix}</Text></View>
    </View>
  );
}

type Props = { offer: Offer; settings: OfferSettings; link: string; pageLabel: string };

export function OfferPdf({ offer, settings, link, pageLabel }: Props) {
  const { doc } = offer;
  const totals = offerTotals(doc);
  const monthly = doc.items.filter((i) => i.recurring);
  const oneOff = doc.items.filter((i) => !i.recurring);
  const legalIds = [settings.cui && `CUI ${settings.cui}`, settings.regCom && `Reg. Com. ${settings.regCom}`].filter(Boolean).join(" · ");
  const bank = [settings.bank, settings.iban && `IBAN ${settings.iban}`].filter(Boolean).join(" · ");
  const vatNote = doc.vatMode === "plus" ? "Prețurile nu includ TVA." : doc.vatMode === "inclus" ? "Prețurile includ TVA." : "Prețurile nu conțin TVA.";

  return (
    <Document title={`Ofertă ${offer.number}`} author={company.name} language="ro">
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt; the PDF title names the firm */}
          <Image src={logo} style={s.logo} />
          <View style={s.headRight}>
            <Text style={s.kicker}>OFERTĂ</Text>
            <Text style={s.number}>{offer.number}</Text>
            <Text style={s.muted}>Data: {date(offer.sentAt ?? offer.createdAt)}</Text>
          </View>
        </View>

        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.label}>CĂTRE</Text>
            <Text style={s.strong}>{doc.clientCompany || doc.clientName}</Text>
            {doc.clientCompany ? <Text>{doc.clientName}</Text> : null}
            {doc.clientEmail ? <Text style={s.muted}>{doc.clientEmail}</Text> : null}
          </View>
          <View style={s.party}>
            <Text style={s.label}>DE LA</Text>
            <Text style={s.strong}>{settings.legalName || company.name}</Text>
            {legalIds ? <Text style={s.muted}>{legalIds}</Text> : null}
            <Text style={s.muted}>{company.address}</Text>
          </View>
        </View>

        {doc.intro ? <Text style={s.intro}>{doc.intro}</Text> : null}

        <Items title="Servicii lunare" items={monthly} />
        <Items title="Servicii o singură dată" items={oneOff} />

        <View style={s.totals} wrap={false}>
          {monthly.length > 0 && (
            <TotalBox title="Lunar" gross={totals.monthly} discount={totals.discountMonthly} percent={doc.discount} vat={totals.vatMonthly} total={totals.totalMonthly} vatMode={doc.vatMode} rate={doc.vatRate} suffix=" / lună" />
          )}
          {oneOff.length > 0 && (
            <TotalBox title="O singură dată" gross={totals.oneOff} discount={totals.discountOneOff} percent={doc.discount} vat={totals.vatOneOff} total={totals.totalOneOff} vatMode={doc.vatMode} rate={doc.vatRate} suffix="" />
          )}
        </View>
        <Text style={[s.block, s.muted]}>{vatNote}</Text>

        <Text style={s.validity}>Oferta este valabilă până la {date(validUntil(offer))} ({doc.validDays} de zile).</Text>

        {doc.paymentTerms ? (
          <View style={s.block} wrap={false}>
            <Text style={s.label}>CONDIȚII DE PLATĂ</Text>
            <Text>{doc.paymentTerms}</Text>
            {bank ? <Text style={s.muted}>{bank}</Text> : null}
          </View>
        ) : null}
        {settings.terms ? (
          <View style={s.block} wrap={false}>
            <Text style={s.label}>CONDIȚII</Text>
            <Text>{settings.terms}</Text>
          </View>
        ) : null}
        {doc.notes ? (
          <View style={s.block} wrap={false}>
            <Text style={s.label}>OBSERVAȚII</Text>
            <Text>{doc.notes}</Text>
          </View>
        ) : null}
        <View style={s.block} wrap={false}>
          {doc.preparedBy ? <Text>Întocmită de: <Text style={s.strong}>{doc.preparedBy}</Text></Text> : null}
          <Text style={s.muted}>Oferta online și acceptare: {link}</Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            {company.name} · {company.address} · {company.phones.map((p) => p.label).join(" · ")} · {company.email}
          </Text>
          <Text>{pageLabel}</Text>
        </View>
      </Page>
    </Document>
  );
}

const countPages = (pdf: Buffer) => (pdf.toString("latin1").match(/\/Type\s*\/Page\b(?!s)/g) ?? []).length;

// react-pdf 4.x renders nothing for `render` props (page numbers) in this setup, so the page count comes from a
// first pass: one-page offers say "Pagina 1 / 1", longer ones get their page count on every page.
export async function renderOfferPdf(offer: Offer, settings: OfferSettings, link: string): Promise<Buffer> {
  const single = await renderToBuffer(<OfferPdf offer={offer} settings={settings} link={link} pageLabel="Pagina 1 / 1" />);
  const pages = countPages(single);
  if (pages <= 1) return single;
  return renderToBuffer(<OfferPdf offer={offer} settings={settings} link={link} pageLabel={`${pages} pagini`} />);
}
