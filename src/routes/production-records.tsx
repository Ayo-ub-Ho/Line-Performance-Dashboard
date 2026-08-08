import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";

import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductionMutations, useProductionRecords } from "@/lib/production-store";

export const Route = createFileRoute("/production-records")({
  head: () => ({
    meta: [
      { title: "Production Records | SF PRODUCE" },
      {
        name: "description",
        content:
          "All hourly production records for the packing station: kg produced, boxes, operators and performance per line.",
      },
      { property: "og:title", content: "Production Records | SF PRODUCE" },
      {
        property: "og:description",
        content: "Source of truth for hourly packing production records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductionRecords,
});

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-3xl border-border shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

const headers = [
  "Hour",
  "Packing Line",
  "Farm",
  "Versement",
  "Client",
  "Packaging Configuration",
  "Number of Boxes",
  "Kg Produced",
  "Operators",
  "Performance (kg/operator)",
  "",
];

function ProductionRecords() {
  const records = useProductionRecords();
  const { deleteRecord } = useProductionMutations();
  const navigate = useNavigate();

  const totalKg = records.reduce((s, r) => s + r.kgProduced, 0);
  const totalBoxes = records.reduce((s, r) => s + r.boxes, 0);
  const totalOperators = records.reduce((s, r) => s + r.operators, 0);
  const avgPerformance = totalOperators > 0 ? totalKg / totalOperators : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-[1600px] px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Production Records
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Every saved hourly production entry. This is the source of truth for the
              dashboard.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/hourly-entry" search={{ edit: undefined }}>Go to Hourly Entry</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Records" value={String(records.length)} />
          <SummaryCard label="Total Kg Produced" value={`${round2(totalKg)} kg`} />
          <SummaryCard
            label="Average Performance"
            value={`${avgPerformance.toFixed(2)} kg/op.`}
          />
          <SummaryCard label="Total Boxes" value={String(totalBoxes)} />
        </div>

        <Card className="mt-10 rounded-3xl border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-2xl">Records</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border p-8">
                <p className="text-muted-foreground">
                  No production has been saved yet.
                </p>
                <Button asChild className="rounded-xl">
                  <Link to="/hourly-entry" search={{ edit: undefined }}>Go to Hourly Entry</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border">
                      {headers.map((h, i) => (
                        <th
                          key={i}
                          className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="whitespace-nowrap px-4 py-4 font-semibold">
                          {r.hour}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">{r.line}</td>
                        <td className="whitespace-nowrap px-4 py-4">{r.farm}</td>
                        <td className="whitespace-nowrap px-4 py-4">{r.versement}</td>
                        <td className="whitespace-nowrap px-4 py-4">{r.client}</td>
                        <td className="whitespace-nowrap px-4 py-4">{r.configName}</td>
                        <td className="whitespace-nowrap px-4 py-4 tabular-nums">
                          {r.boxes}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 tabular-nums">
                          {round2(r.kgProduced)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 tabular-nums">
                          {r.operators}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold tabular-nums">
                          {r.performance.toFixed(2)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                              onClick={() =>
                                navigate({
                                  to: "/hourly-entry",
                                  search: { edit: r.id },
                                })
                              }
                            >
                              <Pencil className="size-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg text-destructive hover:text-destructive"
                              onClick={() => deleteRecord.mutate(r.id)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
