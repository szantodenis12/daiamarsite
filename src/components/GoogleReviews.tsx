import { ExternalLink, Star } from "lucide-react";
import { company } from "@/lib/site";
import TrackedLink from "@/components/TrackedLink";
import styles from "./GoogleReviews.module.css";

// No rating, no quotes until the Google Business Profile is claimed and the review link is real (see company.googleReviewUrl).
export default function GoogleReviews({ placement }: { placement: string }) {
  return (
    <aside className={styles.box} aria-labelledby={`${placement}-recenzii`}>
      <span className={styles.tile}><Star aria-hidden /></span>
      <div>
        <h2 id={`${placement}-recenzii`}>Recenzii Google</h2>
        <p>Ați lucrat cu Daiamar? O recenzie pe profilul Google al firmei îi ajută pe cei care ne caută.</p>
        <div className={styles.actions}>
          <TrackedLink kind="review" href={company.googleReviewUrl} placement={placement} className={styles.primary}>
            Lăsați o recenzie <ExternalLink aria-hidden />
          </TrackedLink>
          <TrackedLink kind="review" href={company.googleMapsPlaceUrl} placement={placement} className={styles.secondary}>
            Vedeți recenziile
          </TrackedLink>
        </div>
      </div>
    </aside>
  );
}
