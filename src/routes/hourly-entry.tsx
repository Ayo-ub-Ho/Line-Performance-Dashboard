import { createFileRoute } from "@tanstack/react-router";

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
import { clients, farms, formats, hours, packingLines } from "@/lib/mock-data";

export const Route = createFileRoute("/hourly-entry")({
  head: () => ({
    meta: [
      { title: "Hourly Entry | Packing Station" },
      {
        name: "description",
        content:
          "Record hourly packing data: line, farm, batch, client, format, boxes packed and operators on shift.",
      },
      { property: "og:title", content: "Hourly Entry | Packing Station" },
      {
        property: "og:description",
        content: "Record hourly packing data per line, batch and client.",
      },
    ],
  }),
  component: HourlyEntry,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Picker({ placeholder, options }: { placeholder: string; options: string[] }) {
  return (
    <Select>
      <SelectTrigger className="h-12 rounded-xl text-base">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function HourlyEntry() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Hourly Entry</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Log production for the current hour on each packing line.
        </p>

        <Card className="mt-8 rounded-3xl border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-2xl">Production record</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              <Field label="Hour">
                <Picker placeholder="Select hour" options={hours} />
              </Field>
              <Field label="Line">
                <Picker placeholder="Select line" options={packingLines} />
              </Field>
              <Field label="Farm">
                <Picker placeholder="Select farm" options={farms} />
              </Field>
              <Field label="Batch">
                <Input className="h-12 rounded-xl text-base" placeholder="V-1042" />
              </Field>
              <Field label="Client">
                <Picker placeholder="Select client" options={clients} />
              </Field>
              <Field label="Format">
                <Picker placeholder="Select format" options={formats} />
              </Field>
              <Field label="Number of Boxes">
                <Input type="number" className="h-12 rounded-xl text-base" placeholder="0" />
              </Field>
              <Field label="Operators">
                <Input type="number" className="h-12 rounded-xl text-base" placeholder="0" />
              </Field>

              <div className="sm:col-span-2">
                <Button type="submit" size="lg" className="h-14 w-full rounded-xl text-base font-semibold">
                  Update Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
