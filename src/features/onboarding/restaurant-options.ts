export const countries = [
  {
    value: "CA",
    labelKey: "canada",
  },
  {
    value: "US",
    labelKey: "unitedStates",
  },
  {
    value: "GB",
    labelKey: "unitedKingdom",
  },
  {
    value: "AU",
    labelKey: "australia",
  },
] as const;

export const timezones = [
  "America/Vancouver",
  "America/Edmonton",
  "America/Winnipeg",
  "America/Toronto",
  "America/Halifax",
  "America/St_Johns",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Australia/Sydney",
] as const;

export const currencies = [
  "CAD",
  "USD",
  "GBP",
  "AUD",
] as const;