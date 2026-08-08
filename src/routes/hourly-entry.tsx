import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  hours,
  packagingModes,
} from "@/lib/mock-data";
import {
  useProductionMutations,
  useProductionRecord,
} from "@/lib/production-store";
import { useNameRows, usePackagingConfigs } from "@/lib/supabase-data";

export const Route = createFileRoute("/hourly-entry")({
  validateSearch: (search: Record<string, unknown>) => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
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
  const { edit } = Route.useSearch();
  const navigate = useNavigate();

  const { data: editing } = useProductionRecord(edit);
  const { data: clientRows = [] } = useNameRows("clients");
  const { data: lineRows = [] } = useNameRows("packing_lines");
  const { data: farmRows = [] } = useNameRows("farms");
  const { data: configs = [] } = usePackagingConfigs();
  const { addRecord, updateRecord } = useProductionMutations();

  const clients = clientRows.map((c) => c.name);
  const packingLines = lineRows.map((l) => l.name);
  const farms = farmRows.map((f) => f.name);

  const [hour, setHour] = useState("");
  const [line, setLine] = useState("");
  const [farm, setFarm] = useState("");
  const [versement, setVersement] = useState("");
  const [client, setClient] = useState("");
  const [configId, setConfigId] = useState("");
  const [boxes, setBoxes] = useState("");
  const [operators, setOperators] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill the form once the edited record has loaded.
  useEffect(() => {
    if (!editing) return;
    setHour(editing.hour);
    setLine(editing.line);
    setFarm(editing.farm);
    setVersement(editing.versement);
    setClient(editing.client);
    setConfigId(editing.configId ?? "");
    setBoxes(String(editing.boxes));
    setOperators(String(editing.operators));
  }, [editing]);

  const clientConfigs = useMemo(
    () => configs.filter((c) => c.client === client),
    [configs, client],
  );
  const config = configs.find((c) => c.id === configId) ?? null;
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (
      Object.keys(errors).length > 0 ||
      kgProduced == null ||
      performance == null ||
      kgPerBox == null
    )
      return;
    const payload = {
      hour,
      line,
      lineId: lineRows.find((l) => l.name === line)?.id ?? null,
      farm,
      farmId: farmRows.find((f) => f.name === farm)?.id ?? null,
      versement: versement.trim(),
      client,
      clientId: clientRows.find((c) => c.name === client)?.id ?? null,
      configId,
      configName: config ? buildConfigName(config) : "",
      kgPerBoxSnapshot: kgPerBox,
      boxes: boxesNum,
      operators: operatorsNum,
      kgProduced,
      performance,
    };
    try {
      if (editing) {
        await updateRecord.mutateAsync({ id: editing.id, input: payload });
        toast.success("Production updated successfully", { duration: 2000 });
      } else {
        await addRecord.mutateAsync(payload);
        toast.success("Production saved successfully", { duration: 2000 });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save production");
      return;
    }
    reset();
    navigate({ to: "/production-records" });
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
                  {editing ? "Update Production" : "Save Production"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
