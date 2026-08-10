export const Tags = {
  smoke: "@smoke",
  regression: "@regression",
  api: "@api",
  search: "@search",
  watch: "@watch",
  channel: "@channel",
  authenticated: "@authenticated",
  quarantine: "@quarantine",
} as const;

export type Tag = (typeof Tags)[keyof typeof Tags];
