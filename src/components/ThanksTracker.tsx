"use client";

import { useEffect } from "react";
import { takeConversion } from "@/lib/form-client";
import { track } from "@/lib/consent";

// /multumim/ is the conversion page. It fires generate_lead once per real submission: the form leaves a one-time id in
// sessionStorage and this takes it. Opening the page directly or reloading it fires nothing. track() checks consent.
export default function ThanksTracker({ kind, placement }: { kind: string; placement?: string }) {
  useEffect(() => {
    const id = takeConversion(kind);
    if (id) track("generate_lead", { lead_type: kind, form_placement: placement, conversion_id: id });
  }, [kind, placement]);
  return null;
}
