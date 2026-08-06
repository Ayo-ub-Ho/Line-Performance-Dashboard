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
            {productionHour ?? "—"}
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
        <main className="flex flex-1 flex-col gap-10 px-8 py-8 lg:px-14">
          <section className="h-[62vh] min-h-[420px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                margin={{ top: 80, right: 16, left: 8, bottom: 16 }}
                barCategoryGap={rows.length <= 2 ? "40%" : "25%"}
              >
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="line"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={16}
                  tick={{ fontSize: 56, fontWeight: 900, fill: "#f8fafc" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tick={{ fontSize: 26, fill: "#94a3b8" }}
                />
                <Bar dataKey="performance" radius={[16, 16, 0, 0]} maxBarSize={150}>
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
                    style={{
                      fontSize: 56,
                      fontWeight: 900,
                      fill: "#f8fafc",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section>
            <table className="w-full border-collapse text-left">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.line} className="border-b border-border last:border-0">
                    <td className="py-8 text-4xl font-extrabold lg:text-5xl">{row.line}</td>
                    <td className="py-8 text-3xl font-semibold lg:text-4xl">{row.client}</td>
                    <td className="py-8 text-3xl font-semibold lg:text-4xl">{row.farm}</td>
                    <td className="py-8 text-3xl font-semibold tabular-nums lg:text-4xl">
                      {row.versement}
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
