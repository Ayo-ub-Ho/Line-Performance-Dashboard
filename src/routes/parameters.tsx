import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clients, farms, formats, kgPerBox, packingLines } from "@/lib/mock-data";

export const Route = createFileRoute("/parameters")({
  head: () => ({
    meta: [
      { title: "Parameters | Packing Station" },
      {
        name: "description",
        content:
          "Manage reference data for the packing station: clients, formats, kg per box, packing lines and farms.",
      },
      { property: "og:title", content: "Parameters | Packing Station" },
      {
        property: "og:description",
        content: "Manage clients, formats, kg per box, packing lines and farms.",
      },
    ],
  }),
  component: Parameters,
});

function ListTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  const [data, setData] = useState(rows);

  const update = (r: number, c: number, value: string) =>
    setData((d) => d.map((row, i) => (i === r ? row.map((cell, j) => (j === c ? value : cell)) : row)));

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

function Parameters() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-[1600px] px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Parameters</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Reference data used across the packing station.
        </p>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <ListTable title="Clients" columns={["Client"]} rows={clients.map((c) => [c])} />
          <ListTable title="Formats" columns={["Format"]} rows={formats.map((f) => [f])} />
          <ListTable
            title="Kg per Box"
            columns={["Format", "Kg"]}
            rows={kgPerBox.map((k) => [k.format, String(k.kg)])}
          />
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
