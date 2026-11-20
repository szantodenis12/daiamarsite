import styles from "./LanguageFlags.module.css";

export type Lang = "ro" | "en" | "it" | "fr" | "de" | "es" | "hu";

const names: Record<Lang, string> = {
  ro: "română",
  en: "engleză",
  it: "italiană",
  fr: "franceză",
  de: "germană",
  es: "spaniolă",
  hu: "maghiară",
};

// Flags drawn in a 24x24 box; the CSS rounds them into circles. EN uses the UK flag.
const flags: Record<Lang, React.ReactNode> = {
  ro: (
    <>
      <rect width="8" height="24" fill="#002B7F" />
      <rect x="8" width="8" height="24" fill="#FCD116" />
      <rect x="16" width="8" height="24" fill="#CE1126" />
    </>
  ),
  it: (
    <>
      <rect width="8" height="24" fill="#009246" />
      <rect x="8" width="8" height="24" fill="#F1F2F1" />
      <rect x="16" width="8" height="24" fill="#CE2B37" />
    </>
  ),
  fr: (
    <>
      <rect width="8" height="24" fill="#002654" />
      <rect x="8" width="8" height="24" fill="#F1F2F1" />
      <rect x="16" width="8" height="24" fill="#CE1126" />
    </>
  ),
  de: (
    <>
      <rect width="24" height="8" fill="#000" />
      <rect y="8" width="24" height="8" fill="#DD0000" />
      <rect y="16" width="24" height="8" fill="#FFCE00" />
    </>
  ),
  hu: (
    <>
      <rect width="24" height="8" fill="#CE2939" />
      <rect y="8" width="24" height="8" fill="#F1F2F1" />
      <rect y="16" width="24" height="8" fill="#477050" />
    </>
  ),
  es: (
    <>
      <rect width="24" height="24" fill="#AA151B" />
      <rect y="6" width="24" height="12" fill="#F1BF00" />
    </>
  ),
  en: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0L24 24M24 0L0 24" stroke="#FFF" strokeWidth="5" />
      <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0V24M0 12H24" stroke="#FFF" strokeWidth="7" />
      <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="4" />
    </>
  ),
};

export default function LanguageFlags({ langs }: { langs: Lang[] }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Limbi vorbite</span>
      <ul className={styles.list}>
        {langs.map((l) => (
          <li key={l} title={names[l]}>
            <svg viewBox="0 0 24 24" className={styles.flag} aria-hidden>
              {flags[l]}
            </svg>
            <span className="sr-only">{names[l]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
