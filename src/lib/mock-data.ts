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

export const clients = ["Fresh Market", "GreenLine Export", "Bio Halles", "Nordic Veg"];
export const formats = ["Box 5 kg", "Box 8 kg", "Crate 10 kg", "Punnet 500 g"];
export const packingLines = ["L1", "L2", "L3", "L4", "L5"];
export const farms = ["Domaine Sud", "Ferme El Ward", "Plaine Verte", "Oasis Agri"];

export const kgPerBox = [
  { format: "Box 5 kg", kg: 5 },
  { format: "Box 8 kg", kg: 8 },
  { format: "Crate 10 kg", kg: 10 },
  { format: "Punnet 500 g", kg: 0.5 },
];
