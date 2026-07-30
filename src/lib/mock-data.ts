export type LineRow = {
  line: string;
  farm: string;
  batch: string;
  performance: number;
};

export const lineRows: LineRow[] = [
  { line: "L1", farm: "Domaine Sud", batch: "V-1042", performance: 128 },
  { line: "L2", farm: "Ferme El Ward", batch: "V-1043", performance: 96 },
  { line: "L3", farm: "Plaine Verte", batch: "V-1044", performance: 143 },
  { line: "L4", farm: "Domaine Sud", batch: "V-1045", performance: 74 },
  { line: "L5", farm: "Oasis Agri", batch: "V-1046", performance: 111 },
];

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
export const farms = ["Domaine Sud", "Ferme El Ward", "Plaine Verte", "Oasis Agri"];

export const clientFormats = [
  { client: "KAUFLAND", format: "Standard", kg: 6 },
  { client: "KAUFLAND", format: "Flowpack", kg: 5 },
  { client: "LIDL", format: "Standard", kg: 7 },
  { client: "HF", format: "Bulk", kg: 8 },
];

/** Rank-based bar colors: 1st dark green → 5th red. */
export const rankColors = [
  "var(--color-rank-1)",
  "var(--color-rank-2)",
  "var(--color-rank-3)",
  "var(--color-rank-4)",
  "var(--color-rank-5)",
];
