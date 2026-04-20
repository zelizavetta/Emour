export function nowLocalTime() {
  const now = new Date();

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
         `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function formatDateTime(
  iso: string,
  timeZone: string
) {
  const date = new Date(iso);

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find(p => p.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")} ` +
         `${get("hour")}:${get("minute")}:${get("second")}`;
}