"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "../../CarInventory.module.css";
import { supabase } from "../../lib/supabaseClient";
import { uploadCarPhoto } from "../../lib/storage";
import { revalidateHome } from "../actions";

type ListingStatus = "live" | "draft" | "sold";

type Dealer = {
  id: string;
  business_name: string;
};

type DealerListing = {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  mileage: number;
  price: number;
  status: ListingStatus;
  vin_suffix: string;
  image_url?: string | null;
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatMileage(n: number) {
  return `${new Intl.NumberFormat("en-US").format(n)} mi`;
}

export default function DealerDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [listings, setListings] = useState<DealerListing[]>([]);
  const [error, setError] = useState("");

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [trim, setTrim] = useState("");
  const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ListingStatus>("draft");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const stats = useMemo(() => {
    const live = listings.filter((c) => c.status === "live").length;
    const totalValue = listings
      .filter((c) => c.status !== "sold")
      .reduce((acc, car) => acc + car.price, 0);
    return { count: listings.length, live, totalValue };
  }, [listings]);

  useEffect(() => {
    async function initialize() {
      setError("");
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        router.replace("/");
        return;
      }
      setUserId(user.id);

      let dealerId: string;
      let dealerName: string;

      const { data: dealerRow, error: dealerError } = await supabase
        .from("dealers")
        .select("id, business_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (dealerError) {
        setError(dealerError.message);
        setReady(true);
        return;
      }

      if (!dealerRow) {
        const fallbackName = `${user.email?.split("@")[0] ?? "Dealer"} Motors`;
        const { data: insertedDealer, error: insertDealerError } = await supabase
          .from("dealers")
          .insert([{ user_id: user.id, business_name: fallbackName }])
          .select("id, business_name")
          .single();

        if (insertDealerError || !insertedDealer) {
          setError(insertDealerError?.message ?? "Could not create dealer profile.");
          setReady(true);
          return;
        }

        dealerId = insertedDealer.id;
        dealerName = insertedDealer.business_name;
      } else {
        dealerId = dealerRow.id;
        dealerName = dealerRow.business_name;
      }

      setDealer({ id: dealerId, business_name: dealerName });

      const { data: listingRows, error: listingError } = await supabase
        .from("dealer_listings")
        .select("id, make, model, year, trim, mileage, price, status, vin_suffix")
        .eq("dealer_id", dealerId)
        .order("created_at", { ascending: false });

      if (listingError) {
        setError(listingError.message);
      } else {
        setListings((listingRows ?? []) as DealerListing[]);
      }

      setReady(true);
    }

    void initialize();
  }, [router]);

  async function addListing(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dealer || !userId) return;

    const y = parseInt(year, 10);
    const mi = parseInt(mileage.replace(/\D/g, ""), 10) || 0;
    const pr = parseInt(price.replace(/\D/g, ""), 10) || 0;
    const id = crypto.randomUUID?.() ?? String(Date.now());
    const vinSuffix = id.slice(-6).toUpperCase();
    let imageUrl: string | null = null;

    if (photoFile) {
      try {
        const uploaded = await uploadCarPhoto(photoFile, userId);
        imageUrl = uploaded.publicUrl;
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Failed to upload image.");
        return;
      }
    }

    const { data, error: insertError } = await supabase
      .from("dealer_listings")
      .insert([
        {
          dealer_id: dealer.id,
          owner_id: userId,
          make: make.trim(),
          model: model.trim(),
          year: y,
          trim: trim.trim() || "Standard",
          mileage: mi,
          price: pr,
          status,
          vin_suffix: vinSuffix,
          image_url: imageUrl,
        },
      ])
      .select("id, make, model, year, trim, mileage, price, status, vin_suffix, image_url")
      .single();

    if (insertError || !data) {
      setError(insertError?.message ?? "Could not add listing.");
      return;
    }

    setListings((prev) => [data as DealerListing, ...prev]);
    await revalidateHome();
    setMake("");
    setModel("");
    setYear(String(new Date().getFullYear()));
    setTrim("");
    setMileage("");
    setPrice("");
    setStatus("draft");
    setPhotoFile(null);
    setError("");
  }

  async function removeListing(id: string) {
    const { error: deleteError } = await supabase.from("dealer_listings").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setListings((prev) => prev.filter((row) => row.id !== id));
  }

  if (!ready) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <p>Loading dealer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1>Dealer dashboard</h1>
            <p>{dealer ? `Signed in as ${dealer.business_name}` : "Manage your own listings only."}</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={() => router.push("/")}>
              Back to marketplace
            </button>
          </div>
        </header>

        {error && <p className={styles.authError}>{error}</p>}

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Your total listings</div>
            <div className={styles.statValue}>{stats.count}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Live listings</div>
            <div className={styles.statValue}>{stats.live}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Active inventory value</div>
            <div className={styles.statValue}>{formatPrice(stats.totalValue)}</div>
          </div>
        </section>

        <section className={styles.tableWrap}>
          <div className={styles.tableHead}>
            <h2>Add a listing</h2>
          </div>
          <form className={styles.form} onSubmit={addListing}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="dealer-make">Make</label>
                <input id="dealer-make" value={make} onChange={(e) => setMake(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="dealer-model">Model</label>
                <input id="dealer-model" value={model} onChange={(e) => setModel(e.target.value)} required />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="dealer-year">Year</label>
                <input id="dealer-year" type="number" min={1990} max={2030} value={year} onChange={(e) => setYear(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="dealer-status">Status</label>
                <select id="dealer-status" value={status} onChange={(e) => setStatus(e.target.value as ListingStatus)}>
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="dealer-mileage">Mileage</label>
                <input id="dealer-mileage" value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="dealer-price">Price (USD)</label>
                <input id="dealer-price" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="dealer-trim">Trim</label>
              <input id="dealer-trim" value={trim} onChange={(e) => setTrim(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="dealer-photo">Listing photo</label>
              <input
                id="dealer-photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} type="submit">
                Save listing
              </button>
            </div>
          </form>
        </section>

        <section className={styles.tableWrap} style={{ marginTop: "1rem" }}>
          <div className={styles.tableHead}>
            <h2>Your listings</h2>
          </div>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Year</th>
                  <th>Mileage</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>VIN</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {listings.map((car) => (
                  <tr key={car.id}>
                    <td>{car.make} {car.model}</td>
                    <td>{car.year}</td>
                    <td>{formatMileage(car.mileage)}</td>
                    <td>{formatPrice(car.price)}</td>
                    <td>{car.status}</td>
                    <td>{car.vin_suffix}</td>
                    <td>
                      <button type="button" className={styles.iconBtn} onClick={() => removeListing(car.id)}>
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && (
                  <tr>
                    <td colSpan={7}>No listings yet. Add your first vehicle above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
