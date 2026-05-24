function formatBharatPlateCompact(cleaned: string): string {
  if (cleaned.length <= 2) return cleaned;

  const year = cleaned.slice(0, 2);
  let rest = cleaned.slice(2);

  if (!rest.startsWith("BH")) {
    return rest ? `${year} ${rest}` : year;
  }

  rest = rest.slice(2);
  const digits = rest.replace(/[^0-9]/g, "").slice(0, 4);
  const letters = rest.replace(/[^A-Z]/g, "").slice(0, 2);

  const parts = [year, "BH"];
  if (digits) parts.push(digits);
  if (letters) parts.push(letters);
  return parts.join(" ");
}

function formatClassicPlateCompact(cleaned: string): string {
  if (cleaned.length <= 2) return cleaned;

  const state = cleaned.slice(0, 2);
  let rest = cleaned.slice(2);
  if (!rest) return state;

  const numberMatch = rest.match(/(\d{1,4})$/);
  const number = numberMatch ? numberMatch[1] : "";
  if (number) rest = rest.slice(0, -number.length);

  let series = "";
  const seriesMatch = rest.match(/([A-Z]{1,3})$/);
  if (seriesMatch) {
    series = seriesMatch[1];
    rest = rest.slice(0, -series.length);
  }

  const district = rest;
  return [state, district, series, number].filter(Boolean).join(" ");
}

export function formatIndianPlate(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned) return "";

  if (/^\d/.test(cleaned)) {
    return formatBharatPlateCompact(cleaned);
  }

  return formatClassicPlateCompact(cleaned);
}

export function isValidIndianPlate(plate: string): boolean {
  const normalized = formatIndianPlate(plate);
  const parts = normalized.split(" ").filter(Boolean);

  if (parts.length < 3 || parts.length > 5) return false;

  if (/^\d{2}$/.test(parts[0]) && parts[1] === "BH") {
    return (
      parts.length === 4 &&
      /^\d{4}$/.test(parts[2]) &&
      /^[A-Z]{2}$/.test(parts[3])
    );
  }

  const state = parts[0];
  if (!/^[A-Z]{2}$/.test(state)) return false;

  const registrationNumber = parts[parts.length - 1];
  if (!/^\d{1,4}$/.test(registrationNumber)) return false;

  const middle = parts.slice(1, -1);
  if (middle.length < 1 || middle.length > 3) return false;

  return middle.every((segment) => /^[A-Z0-9]{1,4}$/.test(segment));
}
