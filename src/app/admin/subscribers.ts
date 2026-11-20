import type { SubscriberStatus } from "@/lib/db";

export const SUBSCRIBER_LABELS: Record<SubscriberStatus, string> = {
  pending: "De confirmat",
  confirmed: "Confirmat",
  unsubscribed: "Dezabonat",
};
