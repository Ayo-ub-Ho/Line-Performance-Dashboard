export type LineRow = {
  line: string;
  farm: string;
  batch: string;
  performance: number;
};

export const lineRows: LineRow[] = [
  { line: "L1", farm: "HASSI", batch: "V-1042", performance: 128.4 },
  { line: "L2", farm: "TADDART", batch: "V-1043", performance: 96.7 },
  { line: "L3", farm: "INCHADEN", batch: "V-1044", performance: 143.2 },
  { line: "L4", farm: "SIDI BIBI", batch: "V-1045", performance: 74.5 },
  { line: "L5", farm: "BIOUGRA", batch: "V-1046", performance: 110.9 },
];

export const productionDate = "30/07/2026";
export const productionHour = "11:00";

export const hours = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
];

export const clients = ["KAUFLAND", "LIDL", "HF", "Nordic Veg"];
export const formats = ["Standard", "Flowpack", "Bulk"];
export const packingLines = ["L1", "L2", "L3", "L4", "L5"];
export const farms = ["HASSI", "TADDART", "INCHADEN", "SIDI BIBI", "BIOUGRA"];

/**
 * Packaging modes. Adding a new mode only requires an entry here:
 * `fields` declares which inputs are shown, `derivedKgPerBox` says whether
 * Kg per Box is computed (read-only) or entered manually.
 */
export type PackagingModeId = "sachet" | "bulk";

export type PackagingMode = {
  id: PackagingModeId;
  label: string;
  fields: Array<"unitWeight" | "unitsPerBox">;
  derivedKgPerBox: boolean;
};

export const packagingModes: PackagingMode[] = [
  {
    id: "sachet",
    label: "Sachet",
    fields: ["unitWeight", "unitsPerBox"],
    derivedKgPerBox: true,
  },
  { id: "bulk", label: "Bulk", fields: [], derivedKgPerBox: false },
];

export type PackagingConfig = {
  id: string;
  client: string;
  name: string;
  mode: PackagingModeId;
  /** grams */
  unitWeight: number | null;
  unitsPerBox: number | null;
  /** manual only for modes where derivedKgPerBox is false */
  kgPerBox: number | null;
};

export const packagingConfigs: PackagingConfig[] = [
  {
    id: "cfg-1",
    client: "KAUFLAND",
    name: "Sachet 500g x 10",
    mode: "sachet",
    unitWeight: 500,
    unitsPerBox: 10,
    kgPerBox: null,
  },
  {
    id: "cfg-2",
    client: "LIDL",
    name: "Sachet 1kg x 6",
    mode: "sachet",
    unitWeight: 1000,
    unitsPerBox: 6,
    kgPerBox: null,
  },
  {
    id: "cfg-3",
    client: "HF",
    name: "Vrac 8kg",
    mode: "bulk",
    unitWeight: null,
    unitsPerBox: null,
    kgPerBox: 8,
  },
];

/** Kg per Box resolution: derived for modes like Sachet, manual otherwise. */
export function computeKgPerBox(cfg: PackagingConfig): number | null {
  const mode = packagingModes.find((m) => m.id === cfg.mode);
  if (mode?.derivedKgPerBox) {
    if (cfg.unitWeight == null || cfg.unitsPerBox == null) return null;
    return (cfg.unitWeight * cfg.unitsPerBox) / 1000;
  }
  return cfg.kgPerBox;
}

/** Up to 2 decimals, no trailing zeros: 6, 6.25, 7.5 */
export function formatKg(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "";
  return String(Math.round(value * 100) / 100);
}

/** Configuration name is always derived from the mode + numeric fields. */
export function buildConfigName(cfg: PackagingConfig): string {
  const mode = packagingModes.find((m) => m.id === cfg.mode);
  if (mode?.derivedKgPerBox) {
    if (!cfg.unitWeight || !cfg.unitsPerBox) return "";
    return `${cfg.unitWeight}g × ${cfg.unitsPerBox}`;
  }
  const kg = computeKgPerBox(cfg);
  if (!kg) return "";
  return `${mode?.label ?? "Bulk"} ${formatKg(kg)}kg`;
}

/** Field-level validation messages, keyed by field name. */
export function validateConfig(cfg: PackagingConfig): Record<string, string> {
  const mode = packagingModes.find((m) => m.id === cfg.mode);
  const errors: Record<string, string> = {};
  if (!cfg.client) errors.client = "Client is required";
  if (mode?.fields.includes("unitWeight") && !(Number(cfg.unitWeight) > 0))
    errors.unitWeight = "Must be greater than 0";
  if (mode?.fields.includes("unitsPerBox") && !(Number(cfg.unitsPerBox) > 0))
    errors.unitsPerBox = "Must be greater than 0";
  if (!mode?.derivedKgPerBox && !(Number(cfg.kgPerBox) > 0))
    errors.kgPerBox = "Must be greater than 0";
  return errors;
}



/** Rank-based bar colors: 1st dark green → 5th red. */
export const rankColors = [
  "var(--color-rank-1)",
  "var(--color-rank-2)",
  "var(--color-rank-3)",
  "var(--color-rank-4)",
  "var(--color-rank-5)",
];
