import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type ProductionRecord = {
  id: string;
  hour: string;
  line: string;
  lineId: string | null;
  farm: string;
  farmId: string | null;
  versement: string;
  client: string;
  clientId: string | null;
  configId: string | null;
  configName: string;
  kgPerBoxSnapshot: number;
  boxes: number;
  operators: number;
  kgProduced: number;
  performance: number;
};

export type ProductionRecordInput = Omit<ProductionRecord, "id">;

type DbRecord = {
  id: string;
  hour: string;
  line_id: string | null;
  line_name: string;
  farm_id: string | null;
  farm_name: string;
  versement: string;
  client_id: string | null;
  client_name: string;
  configuration_id: string | null;
  configuration_name: string;
  kg_per_box_snapshot: number;
  boxes: number;
  operators: number;
  kg_produced: number;
  performance: number;
};

const COLUMNS =
  "id, hour, line_id, line_name, farm_id, farm_name, versement, client_id, client_name, configuration_id, configuration_name, kg_per_box_snapshot, boxes, operators, kg_produced, performance";

function toRecord(row: DbRecord): ProductionRecord {
  return {
    id: row.id,
    hour: row.hour,
    line: row.line_name,
    lineId: row.line_id,
    farm: row.farm_name,
    farmId: row.farm_id,
    versement: row.versement,
    client: row.client_name,
    clientId: row.client_id,
    configId: row.configuration_id,
    configName: row.configuration_name,
    kgPerBoxSnapshot: Number(row.kg_per_box_snapshot),
    boxes: row.boxes,
    operators: row.operators,
    kgProduced: Number(row.kg_produced),
    performance: Number(row.performance),
  };
}

function toDb(input: ProductionRecordInput) {
  return {
    hour: input.hour,
    line_id: input.lineId,
    line_name: input.line,
    farm_id: input.farmId,
    farm_name: input.farm,
    versement: input.versement,
    client_id: input.clientId,
    client_name: input.client,
    configuration_id: input.configId,
    configuration_name: input.configName,
    kg_per_box_snapshot: input.kgPerBoxSnapshot,
    boxes: input.boxes,
    operators: input.operators,
    kg_produced: input.kgProduced,
    performance: input.performance,
  };
}

const emptyRecords: ProductionRecord[] = [];

/** Newest-first, matching the previous in-memory ordering. */
export function useProductionRecords(): ProductionRecord[] {
  const { data } = useQuery({
    queryKey: ["production_records"],
    queryFn: async (): Promise<ProductionRecord[]> => {
      const { data, error } = await supabase
        .from("production_records")
        .select(COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return ((data ?? []) as unknown as DbRecord[]).map(toRecord);
    },
  });
  return data ?? emptyRecords;
}

export function useProductionRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["production_records", id],
    enabled: !!id,
    queryFn: async (): Promise<ProductionRecord | null> => {
      const { data, error } = await supabase
        .from("production_records")
        .select(COLUMNS)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data ? toRecord(data as unknown as DbRecord) : null;
    },
  });
}

export function useProductionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["production_records"] });

  const addRecord = useMutation({
    mutationFn: async (input: ProductionRecordInput) => {
      const { error } = await supabase.from("production_records").insert(toDb(input));
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ProductionRecordInput }) => {
      const { error } = await supabase
        .from("production_records")
        .update(toDb(input))
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("production_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { addRecord, updateRecord, deleteRecord };
}
