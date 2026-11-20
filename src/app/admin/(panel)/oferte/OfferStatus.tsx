import { OFFER_STATUS_LABELS, type ShownStatus } from "@/lib/offers";
import styles from "./offers.module.css";

export const OfferStatus = ({ status }: { status: ShownStatus }) => (
  <span className={styles.offerStatus} data-status={status}>{OFFER_STATUS_LABELS[status]}</span>
);
