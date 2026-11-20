// What a visitor sees after a form: on /multumim/ after a normal submission, inline in the form otherwise.
export const THANKS = {
  cerere: { title: "Am primit solicitarea", text: "Vă contactăm telefonic sau prin e-mail, la datele lăsate în formular." },
  apel: { title: "Am primit numărul dumneavoastră", text: "Vă sunăm noi. Dacă nu răspundem din prima, lăsăm un mesaj și revenim." },
  newsletter: { title: "Un singur pas până la abonare", text: "" },
  documente: { title: "Am primit documentele", text: "Le verificăm și vă contactăm telefonic sau prin e-mail pentru pașii următori." },
} as const;

export type ThanksKind = keyof typeof THANKS;

export const newsletterThanks = (emailed: boolean) =>
  emailed
    ? "Deschideți e-mailul primit de la noi și apăsați pe linkul de confirmare. Fără confirmare nu trimitem nimic."
    : "Am înregistrat adresa dumneavoastră. O confirmăm noi și veți primi noutățile începând cu următoarea ediție.";
