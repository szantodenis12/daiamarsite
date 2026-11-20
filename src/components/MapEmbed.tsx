import { ExternalLink, Navigation } from "lucide-react";
import { company } from "@/lib/site";
import TrackedLink from "@/components/TrackedLink";
import styles from "./MapEmbed.module.css";

const { latitude, longitude } = company.geo;
// Roughly 400 m around the office. OpenStreetMap's embed sets no cookies; the tile requests reach the OSM Foundation.
const span = 0.004;
const bbox = [longitude - span, latitude - span * 0.6, longitude + span, latitude + span * 0.6].map((n) => n.toFixed(6)).join(",");
const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

type Props = { placement: string; compact?: boolean };

export default function MapEmbed({ placement, compact }: Props) {
  return (
    <div className={`${styles.map} ${compact ? styles.compact : ""}`}>
      <iframe src={embedUrl} title={`Hartă OpenStreetMap: ${company.address}`} loading="lazy" referrerPolicy="no-referrer" />
      <div className={styles.bar}>
        <span className={styles.address}>{company.address}</span>
        <TrackedLink kind="maps" href={company.mapsUrl} placement={placement} className={styles.link}>
          Deschide în Google Maps <ExternalLink aria-hidden />
        </TrackedLink>
        <TrackedLink kind="maps" href={company.wazeUrl} placement={placement} className={styles.link}>
          Navighează cu Waze <Navigation aria-hidden />
        </TrackedLink>
      </div>
    </div>
  );
}
