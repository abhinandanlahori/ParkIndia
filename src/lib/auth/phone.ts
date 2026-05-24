export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 10) return digits.slice(-10);
  if (digits.startsWith("91")) return digits.slice(-10);
  return digits.slice(-10);
}

export function phoneToAuthEmail(phone: string): string {
  return `${normalizePhone(phone)}@users.parkindia.app`;
}

export function formatPhoneDisplay(phone: string): string {
  const p = normalizePhone(phone);
  if (p.length !== 10) return phone;
  return `+91 ${p.slice(0, 5)} ${p.slice(5)}`;
}
