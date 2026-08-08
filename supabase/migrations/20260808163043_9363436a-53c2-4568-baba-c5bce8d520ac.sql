CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon, authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can manage clients" ON public.clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.packing_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packing_lines TO anon, authenticated;
GRANT ALL ON public.packing_lines TO service_role;
ALTER TABLE public.packing_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can manage packing lines" ON public.packing_lines FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_packing_lines_updated_at BEFORE UPDATE ON public.packing_lines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farms TO anon, authenticated;
GRANT ALL ON public.farms TO service_role;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can manage farms" ON public.farms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.packaging_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'sachet',
  unit_weight NUMERIC,
  units_per_box INTEGER,
  kg_per_box NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packaging_configurations TO anon, authenticated;
GRANT ALL ON public.packaging_configurations TO service_role;
ALTER TABLE public.packaging_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can manage packaging configurations" ON public.packaging_configurations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_packaging_configurations_updated_at BEFORE UPDATE ON public.packaging_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.production_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hour TEXT NOT NULL,
  line_id UUID REFERENCES public.packing_lines(id) ON DELETE SET NULL,
  line_name TEXT NOT NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  farm_name TEXT NOT NULL,
  versement TEXT NOT NULL DEFAULT '',
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  configuration_id UUID REFERENCES public.packaging_configurations(id) ON DELETE SET NULL,
  configuration_name TEXT NOT NULL DEFAULT '',
  kg_per_box_snapshot NUMERIC NOT NULL,
  boxes INTEGER NOT NULL,
  operators INTEGER NOT NULL,
  kg_produced NUMERIC NOT NULL,
  performance NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.production_records TO anon, authenticated;
GRANT ALL ON public.production_records TO service_role;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can manage production records" ON public.production_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_production_records_updated_at BEFORE UPDATE ON public.production_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.clients (name) VALUES ('KAUFLAND'), ('LIDL'), ('HF'), ('Nordic Veg');
INSERT INTO public.packing_lines (name) VALUES ('L1'), ('L2'), ('L3'), ('L4'), ('L5');
INSERT INTO public.farms (name) VALUES ('HASSI'), ('TADDART'), ('INCHADEN'), ('SIDI BIBI'), ('BIOUGRA');

INSERT INTO public.packaging_configurations (client_id, name, mode, unit_weight, units_per_box, kg_per_box)
SELECT id, '500g × 10', 'sachet', 500, 10, NULL FROM public.clients WHERE name = 'KAUFLAND';
INSERT INTO public.packaging_configurations (client_id, name, mode, unit_weight, units_per_box, kg_per_box)
SELECT id, '1000g × 6', 'sachet', 1000, 6, NULL FROM public.clients WHERE name = 'LIDL';
INSERT INTO public.packaging_configurations (client_id, name, mode, unit_weight, units_per_box, kg_per_box)
SELECT id, 'Bulk 8kg', 'bulk', NULL, NULL, 8 FROM public.clients WHERE name = 'HF';