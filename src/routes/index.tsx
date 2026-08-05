import { createFileRoute } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";
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

import { rankColors } from "@/lib/mock-data";
import { useProductionRecords } from "@/lib/production-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Line Performance TV Dashboard | SF PRODUCE" },
      {
        name: "description",
        content:
          "Real-time TV display ranking packing lines L1 to L5 by performance in kg per operator, with farm and versement per line.",
      },
      { property: "og:title", content: "Line Performance TV Dashboard | SF PRODUCE" },
      {
        property: "og:description",
        content: "Real-time packing line ranking in kg per operator for the packing station.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TvDashboard,
});

const pad = (n: number) => String(n).padStart(2, "0");

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function nextHour(hour: string) {
  const [h, m] = hour.split(":");
  return `${pad((Number(h) + 1) % 24)}:${m ?? "00"}`;
}

function TvDashboard() {
  const records = useProductionRecords();
  const now = useNow();

  // Records are stored newest-first: the first match per line is the latest one.
  const latestByLine = new Map<string, (typeof records)[number]>();
  for (const r of records) if (!latestByLine.has(r.line)) latestByLine.set(r.line, r);

  const rows = [...latestByLine.values()].sort((a, b) => b.performance - a.performance);

  const productionHour = rows[0]?.hour ?? records[0]?.hour ?? null;

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-border px-8 py-6 lg:px-14">
        <div className="flex items-center gap-5">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="size-9" />
          </span>
          <div>
            <p className="font-display text-2xl font-bold tracking-tight lg:text-3xl">
              SF PRODUCE
            </p>
            <h1 className="font-display text-4xl font-extrabold uppercase tracking-tight lg:text-6xl">
              Line Performance
            </h1>
          </div>
        </div>
        <div className="text-right tabular-nums">
          <p className="text-2xl font-semibold text-muted-foreground lg:text-3xl">
            {now
              ? `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
              : "--/--/----"}
          </p>
          <p className="text-4xl font-bold lg:text-6xl">
            {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : "--:--"}
          </p>
          <p className="mt-1 text-2xl font-bold text-primary lg:text-4xl">
            {productionHour ? `${productionHour} → ${nextHour(productionHour)}` : "—"}
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <p className="text-4xl font-semibold text-muted-foreground lg:text-5xl">
            Waiting for production records…
          </p>
        </div>
      ) : (
        <main className="flex flex-1 flex-col gap-8 px-8 py-8 lg:px-14">
          <section className="h-[62vh] min-h-[420px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 70, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="line"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 56, fontWeight: 800, fill: "var(--color-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tick={{ fontSize: 26, fill: "var(--color-muted-foreground)" }}
                />
                <Bar dataKey="performance" radius={[16, 16, 0, 0]} maxBarSize={190}>
                  {rows.map((row, i) => (
                    <Cell
                      key={row.line}
                      fill={rankColors[Math.min(i, rankColors.length - 1)]}
                    />
                  ))}
                  <LabelList
                    dataKey="performance"
                    position="top"
                    formatter={(v: number) => v.toFixed(2)}
                    style={{ fontSize: 56, fontWeight: 800, fill: "var(--color-foreground)" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-xl font-semibold uppercase tracking-wide text-muted-foreground lg:text-2xl">
                    Line
                  </th>
                  <th className="py-3 text-xl font-semibold uppercase tracking-wide text-muted-foreground lg:text-2xl">
                    Farm
                  </th>
                  <th className="py-3 text-xl font-semibold uppercase tracking-wide text-muted-foreground lg:text-2xl">
                    Versement
                  </th>
                  <th className="py-3 text-right text-xl font-semibold uppercase tracking-wide text-muted-foreground lg:text-2xl">
                    Rendement (kg/op.)
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.line} className="border-b border-border last:border-0">
                    <td className="py-5 text-3xl font-bold lg:text-4xl">{row.line}</td>
                    <td className="py-5 text-2xl lg:text-3xl">{row.farm}</td>
                    <td className="py-5 text-2xl tabular-nums lg:text-3xl">{row.versement}</td>
                    <td className="py-5 text-right text-3xl font-bold tabular-nums lg:text-4xl">
                      {row.performance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      )}
    </div>
  );
}
