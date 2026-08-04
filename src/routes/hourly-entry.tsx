import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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
  clients,
  computeKgPerBox,
  farms,
  hours,
  packagingConfigs,
  packagingModes,
  packingLines,
} from "@/lib/mock-data";

export const Route = createFileRoute("/hourly-entry")({
  head: () => ({
    meta: [
      { title: "Hourly Entry | SF PRODUCE" },
      {
        name: "description",
        content:
          "Record hourly packing data: line, farm, versement, client, packaging configuration, boxes packed and operators on shift.",
      },
      { property: "og:title", content: "Hourly Entry | SF PRODUCE" },
      {
        property: "og:description",
        content: "Record hourly packing data per line, versement and client.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HourlyEntry,
});

type Entry = {
  id: string;
  hour: string;
  line: string;
  farm: string;
  versement: string;
  client: string;
  configId: string;
  configName: string;
  boxes: number;
  operators: number;
  kgProduced: number;
  performance: number;
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

function HourlyEntry() {
  const [hour, setHour] = useState("");
  const [line, setLine] = useState("");
  const [farm, setFarm] = useState("");
  const [versement, setVersement] = useState("");
  const [client, setClient] = useState("");
  const [configId, setConfigId] = useState("");
  const [boxes, setBoxes] = useState("");
  const [operators, setOperators] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);

  const clientConfigs = useMemo(
    () => packagingConfigs.filter((c) => c.client === client),
    [client],
  );
  const config = packagingConfigs.find((c) => c.id === configId) ?? null;
  const mode = packagingModes.find((m) => m.id === config?.mode) ?? null;
  const kgPerBox = config ? computeKgPerBox(config) : null;

  const boxesNum = Number(boxes);
  const operatorsNum = Number(operators);
  const kgProduced =
    kgPerBox != null && boxesNum > 0 ? kgPerBox * boxesNum : null;
  const performance =
    kgProduced != null && operatorsNum > 0 ? kgProduced / operatorsNum : null;

  const errors: Record<string, string> = {};
  if (!hour) errors.hour = "Hour is required";
  if (!line) errors.line = "Line is required";
  if (!farm) errors.farm = "Farm is required";
  if (!versement.trim()) errors.versement = "Versement is required";
  if (!client) errors.client = "Client is required";
  if (!configId) errors.configId = "Configuration is required";
  if (!(boxesNum > 0)) errors.boxes = "Must be greater than 0";
  if (!(operatorsNum > 0)) errors.operators = "Must be greater than 0";
  const show = (k: string) => (submitted ? errors[k] : undefined);

  const reset = () => {
    setHour("");
    setLine("");
    setFarm("");
    setVersement("");
    setClient("");
    setConfigId("");
    setBoxes("");
    setOperators("");
    setSubmitted(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || kgProduced == null || performance == null)
      return;
    setEntries((all) => [
      {
        id: `entry-${Date.now()}`,
        hour,
        line,
        farm,
        versement: versement.trim(),
        client,
        configId,
        configName: config ? buildConfigName(config) : "",
        boxes: boxesNum,
        operators: operatorsNum,
        kgProduced,
        performance,
      },
      ...all,
    ]);
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Hourly Entry</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Log production for the current hour on one packing line.
        </p>

        <Card className="mt-8 rounded-3xl border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-2xl">Production record</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6 sm:grid-cols-2" onSubmit={onSubmit}>
              <Field label="Hour" error={show("hour")}>
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger className="h-12 rounded-xl text-base">
                    <SelectValue placeholder="Select hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Packing Line" error={show("line")}>
                <Select value={line} onValueChange={setLine}>
                  <SelectTrigger className="h-12 rounded-xl text-base">
                    <SelectValue placeholder="Select line" />
                  </SelectTrigger>
                  <SelectContent>
                    {packingLines.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Farm" error={show("farm")}>
                <Select value={farm} onValueChange={setFarm}>
                  <SelectTrigger className="h-12 rounded-xl text-base">
                    <SelectValue placeholder="Select farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Versement" error={show("versement")}>
                <Input
                  value={versement}
                  onChange={(e) => setVersement(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  placeholder="V-1042"
                />
              </Field>

              <Field label="Client" error={show("client")}>
                <Select
                  value={client}
                  onValueChange={(v) => {
                    setClient(v);
                    setConfigId("");
                  }}
                >
                  <SelectTrigger className="h-12 rounded-xl text-base">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Packaging Configuration" error={show("configId")}>
                <Select value={configId} onValueChange={setConfigId} disabled={!client}>
                  <SelectTrigger className="h-12 rounded-xl text-base">
                    <SelectValue
                      placeholder={client ? "Select configuration" : "Select a client first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clientConfigs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {buildConfigName(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {config && (
                  <p className="text-xs text-muted-foreground">
                    Mode: {mode?.label} · {kgPerBox ?? 0} kg per box
                  </p>
                )}
              </Field>

              <Field label="Number of Boxes" error={show("boxes")}>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={boxes}
                  onChange={(e) => setBoxes(e.target.value)}
                  className="h-12 rounded-xl text-base tabular-nums"
                  placeholder="0"
                />
              </Field>

              <Field label="Operators (Effectif)" error={show("operators")}>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={operators}
                  onChange={(e) => setOperators(e.target.value)}
                  className="h-12 rounded-xl text-base tabular-nums"
                  placeholder="0"
                />
              </Field>

              <div className="sm:col-span-2 rounded-2xl border border-border bg-muted/40 p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Kg Produced
                    </p>
                    <p className="mt-1 text-4xl font-bold tabular-nums">
                      {kgProduced != null ? `${Math.round(kgProduced * 100) / 100} kg` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Performance
                    </p>
                    <p className="mt-1 text-4xl font-bold tabular-nums">
                      {performance != null
                        ? `${performance.toFixed(2)} kg/operator`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full rounded-xl text-base font-semibold"
                >
                  Save Production
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {entries.length > 0 && (
          <Card className="mt-8 rounded-3xl border-border shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-2xl">Saved this session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-5 py-4"
                >
                  <div className="font-semibold">
                    {e.hour} · {e.line} · {e.farm} · {e.versement}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {e.client} · {e.configName} · {e.boxes} boxes · {e.operators} op.
                  </div>
                  <div className="font-bold tabular-nums">
                    {Math.round(e.kgProduced * 100) / 100} kg ·{" "}
                    {e.performance.toFixed(2)} kg/op.
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
