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

let records: ProductionRecord[] = [];
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
