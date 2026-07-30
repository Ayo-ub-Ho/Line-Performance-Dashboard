import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { AppNav } from "@/components/AppNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { lineRows } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Line Performance Dashboard | Packing Station" },
      {
        name: "description",
        content:
          "Live TV dashboard showing packing line performance in kg per operator, farm and batch for lines L1 to L5.",
      },
      { property: "og:title", content: "Line Performance Dashboard | Packing Station" },
      {
        property: "og:description",
        content: "Live packing line performance per operator, farm and batch.",
      },
    ],
  }),
  component: Dashboard,
});

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Dashboard() {
  const now = useNow();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
            Line Performance Dashboard
          </h1>
          <div className="text-right">
            <p className="text-lg font-semibold text-muted-foreground lg:text-2xl">
              {now
                ? now.toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <p className="font-display text-5xl font-bold tabular-nums text-primary lg:text-7xl">
              {now ? now.toLocaleTimeString(undefined, { hour12: false }) : "--:--:--"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <Card className="rounded-3xl border-border shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-2xl">Active Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-base font-semibold">Line</TableHead>
                    <TableHead className="text-base font-semibold">Farm</TableHead>
                    <TableHead className="text-base font-semibold">Batch</TableHead>
                    <TableHead className="text-right text-base font-semibold">
                      Performance (kg/op)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineRows.map((row) => (
                    <TableRow key={row.line}>
                      <TableCell className="py-5 text-2xl font-bold">{row.line}</TableCell>
                      <TableCell className="text-lg">{row.farm}</TableCell>
                      <TableCell className="text-lg tabular-nums">{row.batch}</TableCell>
                      <TableCell className="text-right text-2xl font-bold tabular-nums text-primary">
                        {row.performance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-2xl">Performance by Line</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px] xl:h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lineRows} margin={{ top: 24, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="line"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 18, fontWeight: 700, fill: "var(--color-foreground)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tick={{ fontSize: 14, fill: "var(--color-muted-foreground)" }}
                  />
                  <Bar dataKey="performance" fill="var(--color-primary)" radius={[12, 12, 0, 0]} barSize={64}>
                    <LabelList
                      dataKey="performance"
                      position="top"
                      style={{ fontSize: 18, fontWeight: 700, fill: "var(--color-foreground)" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
