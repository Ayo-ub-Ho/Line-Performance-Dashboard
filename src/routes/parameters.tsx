import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  clients as initialClients,
  computeKgPerBox,
  farms,
  packagingConfigs,
  packagingModes,
  packingLines,
  type PackagingConfig,
  type PackagingModeId,
} from "@/lib/mock-data";

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

function ListTable({
  title,
  columns,
  rows,
  value,
  onChange,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  value?: string[][];
  onChange?: (next: string[][]) => void;
}) {
  const [internal, setInternal] = useState(rows);
  const data = value ?? internal;
  const setData = (updater: (d: string[][]) => string[][]) => {
    if (onChange) onChange(updater(data));
    else setInternal(updater);
  };

  const update = (r: number, c: number, v: string) =>
    setData((d) => d.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? v : cell)) : row)));

  return (
    <Card className="rounded-3xl border-border shadow-[var(--shadow-card)]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl">{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setData((d) => [...d, columns.map(() => "")])}
        >
          <Plus className="size-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className="grid gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr)) 44px` }}
        >
          {columns.map((c) => (
            <span key={c}>{c}</span>
          ))}
          <span />
        </div>
        {data.map((row, r) => (
          <div
            key={r}
            className="grid items-center gap-3"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr)) 44px` }}
          >
            {row.map((cell, c) => (
              <Input
                key={c}
                value={cell}
                onChange={(e) => update(r, c, e.target.value)}
                className="h-11 rounded-xl"
              />
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:text-destructive"
              onClick={() => setData((d) => d.filter((_, i) => i !== r))}
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
const str = (v: number | null) => (v == null ? "" : String(v));

function ConfigCard({
  config,
  clientOptions,
  onChange,
  onRemove,
}: {
  config: PackagingConfig;
  clientOptions: string[];
  onChange: (next: PackagingConfig) => void;
  onRemove: () => void;
}) {
  const mode = packagingModes.find((m) => m.id === config.mode);
  const showUnitWeight = mode?.fields.includes("unitWeight") ?? false;
  const showUnitsPerBox = mode?.fields.includes("unitsPerBox") ?? false;
  const derived = mode?.derivedKgPerBox ?? false;
  const kgPerBox = computeKgPerBox(config);

  const set = (patch: Partial<PackagingConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="grid gap-4 md:grid-cols-[repeat(2,minmax(0,1fr))_44px]">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Client
          </Label>
          <Select value={config.client} onValueChange={(v) => set({ client: v })}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clientOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
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
            value={buildConfigName(config)}
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
            value={config.mode}
            onValueChange={(v) => set({ mode: v as PackagingModeId })}
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
              value={str(config.unitWeight)}
              onChange={(e) => set({ unitWeight: numOrNull(e.target.value) })}
              className="h-11 rounded-xl"
              placeholder="500"
            />
          </div>
        )}

        {showUnitsPerBox && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Units per Box
            </Label>
            <Input
              type="number"
              value={str(config.unitsPerBox)}
              onChange={(e) => set({ unitsPerBox: numOrNull(e.target.value) })}
              className="h-11 rounded-xl"
              placeholder="10"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kg per Box {derived && <span className="normal-case">(auto)</span>}
          </Label>
          <Input
            type="number"
            readOnly={derived}
            disabled={derived}
            value={derived ? str(kgPerBox) : str(config.kgPerBox)}
            onChange={(e) => set({ kgPerBox: numOrNull(e.target.value) })}
            className={
              derived
                ? "h-11 cursor-not-allowed rounded-xl bg-muted font-semibold tabular-nums"
                : "h-11 rounded-xl tabular-nums"
            }
            placeholder={derived ? "Calculated" : "8"}
          />
        </div>
      </div>
    </div>
  );
}

function Parameters() {
  const [configs, setConfigs] = useState<PackagingConfig[]>(packagingConfigs);

  const addConfig = () =>
    setConfigs((c) => [
      ...c,
      {
        id: `cfg-${Date.now()}`,
        client: initialClients[0] ?? "",
        name: "",
        mode: "sachet",
        unitWeight: null,
        unitsPerBox: null,
        kgPerBox: null,
      },
    ]);

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
            <Button variant="outline" size="sm" className="rounded-full" onClick={addConfig}>
              <Plus className="size-4" /> Add configuration
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {configs.map((cfg) => (
              <ConfigCard
                key={cfg.id}
                config={cfg}
                clientOptions={initialClients}
                onChange={(next) =>
                  setConfigs((all) => all.map((c) => (c.id === cfg.id ? next : c)))
                }
                onRemove={() => setConfigs((all) => all.filter((c) => c.id !== cfg.id))}
              />
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <ListTable title="Clients" columns={["Client"]} rows={initialClients.map((c) => [c])} />
          <ListTable
            title="Packing Lines"
            columns={["Line"]}
            rows={packingLines.map((l) => [l])}
          />
          <ListTable title="Farms" columns={["Farm"]} rows={farms.map((f) => [f])} />
        </div>
      </main>
    </div>
  );
}
