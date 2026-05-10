import { createClient } from "@supabase/supabase-js";
import { seedCars, type ListingStatus } from "./cars";

export type CarListing = {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  mileage: number;
  price: number;
  status: ListingStatus;
  vinSuffix: string;
};

export function listingsFromSeed(): CarListing[] {
  return seedCars.map((car) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    year: car.year,
    trim: car.trim,
    mileage: car.mileage,
    price: car.price,
    status: car.status,
    vinSuffix: car.vinSuffix,
  }));
}

type DealerListingRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  mileage: number;
  price: number | string;
  status: string;
  vin_suffix: string;
};

function rowToCarListing(row: DealerListingRow): CarListing {
  const rawVin = row.vin_suffix ?? "";
  const vinSuffix = rawVin.startsWith("…") ? rawVin : `…${rawVin}`;
  const price = typeof row.price === "string" ? parseFloat(row.price) : row.price;
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    trim: row.trim,
    mileage: row.mileage,
    price: Number.isFinite(price) ? price : 0,
    status: row.status as ListingStatus,
    vinSuffix,
  };
}

/** Server-side marketplace listing load (public `dealer_listings` read). */
export async function fetchMarketplaceListings(): Promise<CarListing[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return listingsFromSeed();
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("dealer_listings")
    .select("id, make, model, year, trim, mileage, price, status, vin_suffix")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return listingsFromSeed();
  }
  if (!data?.length) {
    return listingsFromSeed();
  }

  return (data as DealerListingRow[]).map(rowToCarListing);
}
