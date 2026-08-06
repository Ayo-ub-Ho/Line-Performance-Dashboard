import { useSyncExternalStore } from "react";

export type ProductionRecord = {
  id: string;
  hour: string;
  line: string;
  farm: string;
  versement: string;
  client: string;
  configId: string;
  configName: string;
  boxes: number;
  operators: number;
  kgProduced: number;
  performance: number;
};

let records: ProductionRecord[] = [
  { id: "rec-1", hour: "11:00 → 12:00", line: "L1", farm: "HASSI", versement: "V120", client: "KAUFLAND", configId: "cfg-1", configName: "500g × 10", boxes: 100, operators: 10, kgProduced: 500, performance: 50 },
  { id: "rec-2", hour: "11:00 → 12:00", line: "L2", farm: "TADDART", versement: "V121", client: "LIDL", configId: "cfg-2", configName: "1000g × 6", boxes: 80, operators: 8, kgProduced: 480, performance: 60 },
  { id: "rec-3", hour: "11:00 → 12:00", line: "L3", farm: "BIOUGRA", versement: "V122", client: "HF", configId: "cfg-3", configName: "Bulk 8kg", boxes: 50, operators: 5, kgProduced: 400, performance: 80 },
  { id: "rec-4", hour: "11:00 → 12:00", line: "L4", farm: "INCHADEN", versement: "V123", client: "HF", configId: "cfg-3", configName: "Bulk 8kg", boxes: 100, operators: 10, kgProduced: 800, performance: 80 },
  { id: "rec-5", hour: "11:00 → 12:00", line: "L5", farm: "SIDI BIBI", versement: "V124", client: "KAUFLAND", configId: "cfg-1", configName: "500g × 10", boxes: 120, operators: 15, kgProduced: 600, performance: 40 },
];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const emptySnapshot: ProductionRecord[] = [];

export function useProductionRecords(): ProductionRecord[] {
  return useSyncExternalStore(
    subscribe,
    () => records,
    () => emptySnapshot,
  );
}

export function getRecord(id: string): ProductionRecord | undefined {
  return records.find((r) => r.id === id);
}

export function addRecord(record: Omit<ProductionRecord, "id">) {
  records = [{ ...record, id: `rec-${Date.now()}` }, ...records];
  emit();
}

export function updateRecord(id: string, patch: Omit<ProductionRecord, "id">) {
  records = records.map((r) => (r.id === id ? { ...patch, id } : r));
  emit();
}

export function deleteRecord(id: string) {
  records = records.filter((r) => r.id !== id);
  emit();
}
