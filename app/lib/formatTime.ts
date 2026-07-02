/**
 * Parses a Supabase timestamp (stored without timezone) as UTC,
 * then displays it in the user's local timezone and language.
 */

export function formatMessageTime(
  dateStr: string,
  locale: string = "tr-TR"
): string {
  // Append 'Z' to treat Supabase's "timestamp without time zone" as UTC
  const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  const date = new Date(utcStr);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (diffDays === 1) {
    const yesterday: Record<string, string> = {
      "tr-TR": "Dün",
      "en-US": "Yesterday",
      "fa-IR": "دیروز",
      "ar-SA": "أمس",
      "de-DE": "Gestern",
      "ru-RU": "Вчера",
    };
    const label = yesterday[locale] ?? "Yesterday";
    return (
      label +
      " " +
      date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    );
  }

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function formatMessageTimeShort(
  dateStr: string,
  locale: string = "tr-TR"
): string {
  const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  return new Date(utcStr).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}