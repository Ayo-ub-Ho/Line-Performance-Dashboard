import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { AppNav } from "@/components/AppNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { lineRows, productionDate, productionHour, rankColors } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Line Performance Dashboard | SF PRODUCE" },
      {
        name: "description",
        content:
          "Live TV dashboard showing packing line performance in kg per operator, farm and versement for lines L1 to L5.",
      },
      { property: "og:title", content: "Line Performance Dashboard | SF PRODUCE" },
      {
        property: "og:description",
        content: "Live packing line performance per operator, farm and versement.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const fmt = (n: number) => n.toFixed(1);

function Dashboard() {
  const ranked = [...lineRows].sort((a, b) => b.performance - a.performance);
  const rankOf = new Map(ranked.map((r, i) => [r.line, i]));
  const colorOf = (line: string) => rankColors[rankOf.get(line) ?? 0] ?? rankColors[rankColors.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-[1900px] px-6 py-10 lg:px-16 lg:py-14">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 border-b border-border pb-8">
          <h1 className="truncate text-4xl font-bold tracking-tight lg:text-6xl 2xl:text-7xl">
            Line Performance Dashboard
          </h1>
          <div className="shrink-0 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground lg:text-sm">
              Production
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums lg:text-3xl">{productionDate}</p>
            <p className="text-xl font-bold tabular-nums lg:text-3xl">{productionHour}</p>
          </div>
        </header>

        <Card className="mt-12 rounded-3xl border-border shadow-[var(--shadow-card)]">
          <CardHeader className="pb-0">
            <CardTitle className="text-3xl lg:text-4xl">Rendement par ligne</CardTitle>
          </CardHeader>
          <CardContent className="h-[56vh] min-h-[460px] pt-8 lg:h-[62vh]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineRows} margin={{ top: 56, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="line"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 44, fontWeight: 800, fill: "var(--color-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={72}
                  tick={{ fontSize: 22, fill: "var(--color-muted-foreground)" }}
                />
                <Bar dataKey="performance" radius={[16, 16, 0, 0]} maxBarSize={150}>
                  {lineRows.map((row) => (
                    <Cell key={row.line} fill={colorOf(row.line)} />
                  ))}
                  <LabelList
                    dataKey="performance"
                    position="top"
                    formatter={(v: number) => fmt(v)}
                    style={{ fontSize: 48, fontWeight: 800, fill: "var(--color-foreground)" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mt-12 rounded-3xl border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl">Production en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg font-semibold lg:text-2xl">Line</TableHead>
                  <TableHead className="text-lg font-semibold lg:text-2xl">Farm</TableHead>
                  <TableHead className="text-lg font-semibold lg:text-2xl">Versement</TableHead>
                  <TableHead className="text-right text-lg font-semibold lg:text-2xl">
                    Rendement (kg/op.)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineRows.map((row) => (
                  <TableRow key={row.line}>
                    <TableCell className="py-6 text-2xl font-bold text-foreground lg:text-4xl">
                      {row.line}
                    </TableCell>
                    <TableCell className="text-xl text-foreground lg:text-3xl">{row.farm}</TableCell>
                    <TableCell className="text-xl tabular-nums text-foreground lg:text-3xl">
                      {row.batch}
                    </TableCell>
                    <TableCell className="text-right text-2xl font-bold tabular-nums text-foreground lg:text-4xl">
                      {fmt(row.performance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

