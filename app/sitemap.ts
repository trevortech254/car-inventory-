import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

type InventoryRow = {
  id: string;
  updated_at?: string | null;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: new URL("/", siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return [homeEntry];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("inventory")
    .select("id, updated_at")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [homeEntry];
  }

  const carEntries: MetadataRoute.Sitemap = (data as InventoryRow[]).map((car) => ({
    url: new URL(`/cars/${car.id}`, siteUrl).toString(),
    lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [homeEntry, ...carEntries];
}
