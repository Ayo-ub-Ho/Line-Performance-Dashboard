import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { PackagingConfig, PackagingModeId } from "@/lib/mock-data";

export type NameRow = { id: string; name: string };

export type NameTable = "clients" | "packing_lines" | "farms";

/** Reference tables (clients / packing lines / farms) --------------------- */

export function useNameRows(table: NameTable) {
  return useQuery({
    queryKey: [table],
    queryFn: async (): Promise<NameRow[]> => {
      const { data, error } = await supabase
        .from(table)
        .select("id, name")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useNameRowMutations(table: NameTable) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [table] });
    qc.invalidateQueries({ queryKey: ["packaging_configurations"] });
  };

  const add = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from(table).insert({ name });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const rename = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from(table).update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { add, rename, remove };
}

/** Packaging configurations ---------------------------------------------- */

export type ConfigRow = PackagingConfig & { clientId: string };

type DbConfig = {
  id: string;
  client_id: string;
  name: string;
  mode: string;
  unit_weight: number | null;
  units_per_box: number | null;
  kg_per_box: number | null;
  clients: { name: string } | null;
};

function toConfig(row: DbConfig): ConfigRow {
  return {
    id: row.id,
    clientId: row.client_id,
    client: row.clients?.name ?? "",
    name: row.name,
    mode: (row.mode as PackagingModeId) ?? "sachet",
    unitWeight: row.unit_weight,
    unitsPerBox: row.units_per_box,
    kgPerBox: row.kg_per_box,
  };
}

export function usePackagingConfigs() {
  return useQuery({
    queryKey: ["packaging_configurations"],
    queryFn: async (): Promise<ConfigRow[]> => {
      const { data, error } = await supabase
        .from("packaging_configurations")
        .select(
          "id, client_id, name, mode, unit_weight, units_per_box, kg_per_box, clients(name)",
        )
        .order("created_at", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as unknown as DbConfig[]).map(toConfig);
    },
  });
}

export function usePackagingConfigMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["packaging_configurations"] });

  const add = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase.from("packaging_configurations").insert({
        client_id: clientId,
        name: "",
        mode: "sachet",
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const save = useMutation({
    mutationFn: async (config: ConfigRow) => {
      const { error } = await supabase
        .from("packaging_configurations")
        .update({
          client_id: config.clientId,
          name: config.name,
          mode: config.mode,
          unit_weight: config.unitWeight,
          units_per_box: config.unitsPerBox,
          kg_per_box: config.kgPerBox,
        })
        .eq("id", config.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("packaging_configurations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { add, save, remove };
}
