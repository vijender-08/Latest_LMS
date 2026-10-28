import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Deterministically formats dates as DD/MM/YYYY to avoid server/client locale hydration mismatch.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return `${d}/${m}/${y}`;
    }
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Deterministically formats datetime to avoid server/client locale hydration mismatch.
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
}

/**
 * Formats numbers with a consistent locale (en-IN) to prevent server/client hydration mismatch.
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
}

/**
 * Formats college / institution names for selection dropdowns in Issue, Return, Catalogue, etc.
 * Formats:
 * - RBCET -> RBCET(Rakshpal Bahadur College of Engineering and Technology)
 * - RBMI  -> RBMI(Rakshpal Bahadur Management Institute)
 * - RBCN  -> RBCN(Rakshpal Bahadur College of Nursing)
 * - RBCP  -> RBCP(Rakshpal Bahadur College of Pharmacy)
 * - RBTTI -> RBTTI
 */
export function getCollegeDropdownLabel(inst: {
  id?: number;
  code?: string | null;
  name?: string | null;
}): string {
  const code = (inst.code || "").toUpperCase().trim();
  const name = (inst.name || "").toUpperCase().trim();

  if (code === "RBCET" || code === "RBMI-ENG" || name.includes("ENGINEERING")) {
    return "RBCET(Rakshpal Bahadur College of Engineering and Technology)";
  }
  if (
    code === "RBMI" ||
    code === "RBMI-MGMT" ||
    name.includes("MANAGEMENT") ||
    name.includes("BUSINESS")
  ) {
    return "RBMI(Rakshpal Bahadur Management Institute)";
  }
  if (code === "RBCN" || code === "RBMI-NURS" || name.includes("NURSING")) {
    return "RBCN(Rakshpal Bahadur College of Nursing)";
  }
  if (code === "RBCP" || code === "RBMI-PHARM" || name.includes("PHARMACY")) {
    return "RBCP(Rakshpal Bahadur College of Pharmacy)";
  }
  if (
    code === "RBTTI" ||
    code === "RBMI-TECH" ||
    name.includes("TEACHER") ||
    name.includes("TRAINING")
  ) {
    return "RBTTI";
  }

  return inst.name ? (code ? `${code}(${inst.name})` : inst.name) : code;
}
