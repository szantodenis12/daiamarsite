/** Read-only demo mode (DEMO_MODE=1, no DATABASE_URL): in-memory sample data, nothing is saved, no email goes out. */
export const isDemo = () => process.env.DEMO_MODE === "1";

export const DEMO_MESSAGE = "Versiune demo: modificările nu se salvează.";

export class DemoReadOnlyError extends Error {
  constructor() {
    super(DEMO_MESSAGE);
    this.name = "DemoReadOnlyError";
  }
}

export const isDemoError = (error: unknown): boolean => error instanceof DemoReadOnlyError || (error instanceof Error && error.name === "DemoReadOnlyError");
