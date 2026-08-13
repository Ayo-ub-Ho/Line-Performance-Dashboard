import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppNav } from "@/components/AppNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildConfigName,
  computeKgPerBox,
  formatKg,
  packagingModes,
  validateConfig,
  type PackagingConfig,
  type PackagingModeId,
} from "@/lib/mock-data";
import {
  useNameRows,
  useNameRowMutations,
  usePackagingConfigMutations,
  usePackagingConfigs,
  type ConfigRow,
  type NameRow,
  type NameTable,
} from "@/lib/supabase-data";

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

/** Turn a Supabase error into a production-floor friendly message. */
function friendlyError(error: unknown, label: string): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === "23503")
    return `${label} is currently in use by existing records and cannot be deleted.`;
  if (code === "23505") return `${label} already exists.`;
  return (error as { message?: string } | null)?.message ?? "Something went wrong.";
}

/** Reference list section (Clients / Packing Lines / Farms) ---------------- */

function NameSection({
  title,
  description,
  singular,
  table,
}: {
  title: string;
  description: string;
  singular: string;
  table: NameTable;
}) {
  const { data: rows = [] } = useNameRows(table);
  const { add, rename, remove } = useNameRowMutations(table);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NameRow | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<NameRow | null>(null);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setError(null);
    setFormOpen(true);
  };
  const openEdit = (row: NameRow) => {
    setEditing(row);
    setName(row.name);
    setError(null);
    setFormOpen(true);
  };

  const submit = async () => {
    const value = name.trim();
    if (!value) return setError("Name is required.");
    const duplicate = rows.some(
      (r) => r.id !== editing?.id && r.name.trim().toLowerCase() === value.toLowerCase(),
    );
    if (duplicate) return setError(`This ${singular.toLowerCase()} already exists.`);
    try {
      if (editing) await rename.mutateAsync({ id: editing.id, name: value });
      else await add.mutateAsync(value);
      setFormOpen(false);
      toast.success(editing ? `${singular} updated` : `${singular} added`, {
        duration: 2000,
      });
    } catch (e) {
      setError(friendlyError(e, singular));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const row = deleting;
    setDeleting(null);
    try {
      await remove.mutateAsync(row.id);
      toast.success(`${singular} deleted`, { duration: 2000 });
    } catch (e) {
      toast.error(friendlyError(e, `${singular} "${row.name}"`));
    }
  };

  return (
    <Card className="rounded-3xl border-border shadow-[var(--shadow-card)]">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" className="rounded-full" onClick={openAdd}>
          <Plus className="size-4" /> Add {singular}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No {title.toLowerCase()} yet.
          </p>
        )}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3"
          >
            <span className="truncate text-lg font-semibold">{row.name}</span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-muted-foreground hover:text-foreground"
                onClick={() => openEdit(row)}
                aria-label={`Edit ${row.name}`}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-muted-foreground hover:text-destructive"
                onClick={() => setDeleting(row)}
                aria-label={`Delete ${row.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${singular}` : `Add ${singular}`}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {singular} name
            </Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
              }}
              className="h-11 rounded-xl"
              aria-invalid={!!error}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button className="rounded-full" onClick={() => void submit()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will be permanently removed from the parameters. Existing
              production records keep their saved values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/** Packaging configurations ----------------------------------------------- */

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const intOrNull = (v: string) => {
  const n = numOrNull(v);
  return n == null || Number.isNaN(n) ? null : Math.trunc(n);
};
const str = (v: number | null) => (v == null ? "" : String(v));

const emptyConfig: ConfigRow = {
  id: "",
  clientId: "",
  client: "",
  name: "",
  mode: "sachet",
  unitWeight: null,
  unitsPerBox: null,
  kgPerBox: null,
};

function ConfigDialog({
  open,
  onOpenChange,
  initial,
  clientOptions,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ConfigRow | null;
  clientOptions: NameRow[];
  onSubmit: (config: ConfigRow) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ConfigRow>(initial ?? emptyConfig);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initial ?? emptyConfig);
      setSubmitted(false);
      setError(null);
    }
  }, [open, initial]);

  const mode = packagingModes.find((m) => m.id === draft.mode);
  const showUnitWeight = mode?.fields.includes("unitWeight") ?? false;
  const showUnitsPerBox = mode?.fields.includes("unitsPerBox") ?? false;
  const derived = mode?.derivedKgPerBox ?? false;
  const kgPerBox = computeKgPerBox(draft);
  const errors = validateConfig(draft);
  const show = (key: string) => (submitted ? errors[key] : undefined);

  const edit = (patch: Partial<PackagingConfig> & Partial<ConfigRow>) =>
    setDraft((prev) => {
      const next = { ...prev, ...patch } as ConfigRow;
      return { ...next, name: buildConfigName(next) };
    });

  const submit = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    try {
      await onSubmit({ ...draft, name: buildConfigName(draft) });
      onOpenChange(false);
    } catch (e) {
      setError(friendlyError(e, "Configuration"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit configuration" : "Add configuration"}
          </DialogTitle>
          <DialogDescription>
            Packaging configurations belong to a client and define how many kilograms a
            box contains.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Client
            </Label>
            <Select
              value={draft.clientId}
              onValueChange={(v) =>
                edit({
                  clientId: v,
                  client: clientOptions.find((c) => c.id === v)?.name ?? "",
                })
              }
            >
              <SelectTrigger className="h-11 rounded-xl" aria-invalid={!!show("client")}>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {show("client") && (
              <p className="text-xs font-medium text-destructive">{show("client")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Packaging Mode
            </Label>
            <Select
              value={draft.mode}
              onValueChange={(v) => edit({ mode: v as PackagingModeId })}
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
                min={1}
                step={1}
                inputMode="numeric"
                value={str(draft.unitWeight)}
                onChange={(e) => edit({ unitWeight: intOrNull(e.target.value) })}
                className="h-11 rounded-xl tabular-nums"
                aria-invalid={!!show("unitWeight")}
                placeholder="500"
              />
              {show("unitWeight") && (
                <p className="text-xs font-medium text-destructive">
                  {show("unitWeight")}
                </p>
              )}
            </div>
          )}

          {showUnitsPerBox && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Units per Box
              </Label>
              <Input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={str(draft.unitsPerBox)}
                onChange={(e) => edit({ unitsPerBox: intOrNull(e.target.value) })}
                className="h-11 rounded-xl tabular-nums"
                aria-invalid={!!show("unitsPerBox")}
                placeholder="12"
              />
              {show("unitsPerBox") && (
                <p className="text-xs font-medium text-destructive">
                  {show("unitsPerBox")}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Kg per Box
            </Label>
            <Input
              type="number"
              min={0}
              step={derived ? undefined : 0.01}
              inputMode="decimal"
              readOnly={derived}
              disabled={derived}
              value={derived ? formatKg(kgPerBox) : str(draft.kgPerBox)}
              onChange={(e) => edit({ kgPerBox: numOrNull(e.target.value) })}
              className={
                derived
                  ? "h-11 cursor-not-allowed rounded-xl bg-muted font-semibold tabular-nums"
                  : "h-11 rounded-xl tabular-nums"
              }
              aria-invalid={!derived && !!show("kgPerBox")}
              placeholder={derived ? "Calculated" : "8"}
            />
            {derived ? (
              <p className="text-xs text-muted-foreground">Automatically calculated</p>
            ) : (
              show("kgPerBox") && (
                <p className="text-xs font-medium text-destructive">
                  {show("kgPerBox")}
                </p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Configuration Name <span className="normal-case">(auto)</span>
            </Label>
            <Input
              readOnly
              disabled
              value={buildConfigName(draft)}
              className="h-11 cursor-not-allowed rounded-xl bg-muted font-semibold"
              placeholder="Generated automatically"
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="rounded-full" onClick={() => void submit()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConfigSection() {
  const { data: clientRows = [] } = useNameRows("clients");
  const { data: configs = [] } = usePackagingConfigs();
  const { add, save, remove } = usePackagingConfigMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ConfigRow | null>(null);
  const [deleting, setDeleting] = useState<ConfigRow | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    const cfg = deleting;
    setDeleting(null);
    try {
      await remove.mutateAsync(cfg.id);
      toast.success("Configuration deleted", { duration: 2000 });
    } catch (e) {
      toast.error(friendlyError(e, `Configuration "${cfg.name}"`));
    }
  };

  return (
    <Card className="rounded-3xl border-border shadow-[var(--shadow-card)]">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">Packaging Configurations</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Client packaging formats used to convert boxes into kilograms.
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full"
          disabled={clientRows.length === 0}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Add Configuration
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid gap-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-[1fr_1fr_120px_140px_96px]">
          <span>Client</span>
          <span>Configuration</span>
          <span>Mode</span>
          <span className="sm:text-right">Kg / Box</span>
          <span />
        </div>
        {configs.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No configurations yet.
          </p>
        )}
        {configs.map((cfg) => (
          <div
            key={cfg.id}
            className="grid items-center gap-3 rounded-2xl border border-border px-4 py-3 sm:grid-cols-[1fr_1fr_120px_140px_96px]"
          >
            <span className="truncate font-semibold">{cfg.client}</span>
            <span className="truncate">{cfg.name || "—"}</span>
            <span className="capitalize text-muted-foreground">
              {packagingModes.find((m) => m.id === cfg.mode)?.label ?? cfg.mode}
            </span>
            <span className="tabular-nums font-semibold sm:text-right">
              {formatKg(computeKgPerBox(cfg)) || "—"}
            </span>
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditing(cfg);
                  setFormOpen(true);
                }}
                aria-label="Edit configuration"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-muted-foreground hover:text-destructive"
                onClick={() => setDeleting(cfg)}
                aria-label="Delete configuration"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>

      <ConfigDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        clientOptions={clientRows}
        onSubmit={async (config) => {
          if (config.id) {
            await save.mutateAsync(config);
            toast.success("Configuration updated", { duration: 2000 });
          } else {
            const { id: _id, ...input } = config;
            await add.mutateAsync(input);
            toast.success("Configuration added", { duration: 2000 });
          }
        }}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.client} — {deleting?.name} will be permanently removed. Existing
              production records keep their saved kg per box.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

        <Tabs defaultValue="clients" className="mt-8">
          <TabsList className="h-12 rounded-full p-1">
            <TabsTrigger className="rounded-full px-6" value="clients">
              Clients
            </TabsTrigger>
            <TabsTrigger className="rounded-full px-6" value="lines">
              Packing Lines
            </TabsTrigger>
            <TabsTrigger className="rounded-full px-6" value="farms">
              Farms
            </TabsTrigger>
            <TabsTrigger className="rounded-full px-6" value="configs">
              Packaging Configurations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="mt-6">
            <NameSection
              title="Clients"
              description="Customers the packing station produces for."
              singular="Client"
              table="clients"
            />
          </TabsContent>
          <TabsContent value="lines" className="mt-6">
            <NameSection
              title="Packing Lines"
              description="Physical packing lines on the production floor."
              singular="Line"
              table="packing_lines"
            />
          </TabsContent>
          <TabsContent value="farms" className="mt-6">
            <NameSection
              title="Farms"
              description="Farms supplying the produce being packed."
              singular="Farm"
              table="farms"
            />
          </TabsContent>
          <TabsContent value="configs" className="mt-6">
            <ConfigSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
