import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildConfigName,
  computeKgPerBox,
  formatKg,
  packagingModes,
  validateConfig,
  type PackagingConfig,
  type PackagingModeId,
} from "@/lib/mock-data";
import {
  useNameRows,
  useNameRowMutations,
  usePackagingConfigMutations,
  usePackagingConfigs,
  type ConfigRow,
  type NameRow,
  type NameTable,
} from "@/lib/supabase-data";

export const Route = createFileRoute("/parameters")({
  head: () => ({
    meta: [
      { title: "Parameters | SF PRODUCE" },
      {
        name: "description",
        content:
          "Manage reference data for the packing station: clients, packaging configurations, packing lines and farms.",
      },
      { property: "og:title", content: "Parameters | SF PRODUCE" },
      {
        property: "og:description",
        content: "Manage clients, packaging configurations, packing lines and farms.",
      },
    ],
  }),
  component: Parameters,
});

function NameCell({
  row,
  onCommit,
}: {
  row: NameRow;
  onCommit: (name: string) => void;
}) {
  const [value, setValue] = useState(row.name);
  useEffect(() => setValue(row.name), [row.name]);
  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value.trim() && value !== row.name) onCommit(value.trim());
      }}
      className="h-11 rounded-xl"
    />
  );
}

function ListTable({
  title,
  column,
  table,
}: {
  title: string;
  column: string;
  table: NameTable;
}) {
  const { data: rows = [] } = useNameRows(table);
  const { add, rename, remove } = useNameRowMutations(table);

  return (
    <Card className="rounded-3xl border-border shadow-[var(--shadow-card)]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => add.mutate(`New ${column}`)}
        >
          <Plus className="size-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="grid gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          style={{ gridTemplateColumns: "minmax(0,1fr) 44px" }}
        >
          <span>{column}</span>
          <span />
        </div>
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid items-center gap-3"
            style={{ gridTemplateColumns: "minmax(0,1fr) 44px" }}
          >
            <NameCell row={row} onCommit={(name) => rename.mutate({ id: row.id, name })} />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:text-destructive"
              onClick={() => remove.mutate(row.id)}
              aria-label="Remove row"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const intOrNull = (v: string) => {
  const n = numOrNull(v);
  return n == null || Number.isNaN(n) ? null : Math.trunc(n);
};
const str = (v: number | null) => (v == null ? "" : String(v));

function ConfigCard({
  config,
  clientOptions,
  onChange,
  onRemove,
}: {
  config: ConfigRow;
  clientOptions: NameRow[];
  onChange: (next: ConfigRow) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState<ConfigRow>(config);
  useEffect(() => setDraft(config), [config]);

  const mode = packagingModes.find((m) => m.id === draft.mode);
  const showUnitWeight = mode?.fields.includes("unitWeight") ?? false;
  const showUnitsPerBox = mode?.fields.includes("unitsPerBox") ?? false;
  const derived = mode?.derivedKgPerBox ?? false;
  const kgPerBox = computeKgPerBox(draft);
  const errors = validateConfig(draft);

  const withName = (patch: Partial<PackagingConfig> & Partial<ConfigRow>): ConfigRow => {
    const next = { ...draft, ...patch } as ConfigRow;
    return { ...next, name: buildConfigName(next) };
  };
  /** Local edit, persisted on blur. */
  const edit = (patch: Partial<PackagingConfig>) => setDraft(withName(patch));
  /** Immediate persist (dropdowns). */
  const commit = (patch: Partial<ConfigRow>) => {
    const next = withName(patch);
    setDraft(next);
    onChange(next);
  };
  const flush = () => {
    if (JSON.stringify(draft) !== JSON.stringify(config)) onChange(draft);
  };

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="grid gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))_44px]">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Client
          </Label>
          <Select
            value={draft.clientId}
            onValueChange={(v) =>
              commit({
                clientId: v,
                client: clientOptions.find((c) => c.id === v)?.name ?? "",
              })
            }
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clientOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Configuration Name <span className="normal-case">(auto)</span>
          </Label>
          <Input
            readOnly
            disabled
            value={buildConfigName(draft)}
            className="h-11 cursor-not-allowed rounded-xl bg-muted font-semibold"
            placeholder="Generated automatically"
          />
        </div>

        <div className="flex items-end justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove configuration"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Packaging Mode
          </Label>
          <Select
            value={draft.mode}
            onValueChange={(v) => commit({ mode: v as PackagingModeId })}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {packagingModes.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showUnitWeight && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Unit Weight (g)
            </Label>
            <Input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={str(draft.unitWeight)}
              onChange={(e) => edit({ unitWeight: intOrNull(e.target.value) })}
              onBlur={flush}
              className="h-11 rounded-xl tabular-nums"
              aria-invalid={!!errors.unitWeight}
              placeholder="500"
            />
            {errors.unitWeight && (
              <p className="text-xs font-medium text-destructive">{errors.unitWeight}</p>
            )}
          </div>
        )}

        {showUnitsPerBox && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Units per Box
            </Label>
            <Input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={str(draft.unitsPerBox)}
              onChange={(e) => edit({ unitsPerBox: intOrNull(e.target.value) })}
              onBlur={flush}
              className="h-11 rounded-xl tabular-nums"
              aria-invalid={!!errors.unitsPerBox}
              placeholder="12"
            />
            {errors.unitsPerBox && (
              <p className="text-xs font-medium text-destructive">{errors.unitsPerBox}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kg per Box
          </Label>
          <Input
            type="number"
            min={0}
            step={derived ? undefined : 0.01}
            inputMode="decimal"
            readOnly={derived}
            disabled={derived}
            value={derived ? formatKg(kgPerBox) : str(draft.kgPerBox)}
            onChange={(e) => edit({ kgPerBox: numOrNull(e.target.value) })}
            onBlur={flush}
            className={
              derived
                ? "h-11 cursor-not-allowed rounded-xl bg-muted font-semibold tabular-nums"
                : "h-11 rounded-xl tabular-nums"
            }
            aria-invalid={!derived && !!errors.kgPerBox}
            placeholder={derived ? "Calculated" : "8"}
          />
          {derived ? (
            <p className="text-xs text-muted-foreground">Automatically calculated</p>
          ) : (
            errors.kgPerBox && (
              <p className="text-xs font-medium text-destructive">{errors.kgPerBox}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Parameters() {
  const { data: clientRows = [] } = useNameRows("clients");
  const { data: configs = [] } = usePackagingConfigs();
  const { add, save, remove } = usePackagingConfigMutations();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-[1600px] px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Parameters</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Reference data used across the packing station.
        </p>

        <Card className="mt-8 rounded-3xl border-border shadow-[var(--shadow-card)]">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl">Packaging Configurations</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={clientRows.length === 0}
              onClick={() => clientRows[0] && add.mutate(clientRows[0].id)}
            >
              <Plus className="size-4" /> Add configuration
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {configs.map((cfg) => (
              <ConfigCard
                key={cfg.id}
                config={cfg}
                clientOptions={clientRows}
                onChange={(next) => save.mutate(next)}
                onRemove={() => remove.mutate(cfg.id)}
              />
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ListTable title="Clients" column="Client" table="clients" />
          <ListTable title="Packing Lines" column="Line" table="packing_lines" />
          <ListTable title="Farms" column="Farm" table="farms" />
        </div>
      </main>
    </div>
  );
}
