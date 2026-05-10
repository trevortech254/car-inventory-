"use client";

import React, { useMemo, useState, type FormEvent } from "react";
import styles from "../CarInventory.module.css";

export type ListingStatus = "live" | "draft" | "sold";

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

const initialListings: CarListing[] = [
  {
    id: "1",
    make: "BMW",
    model: "M4 Competition",
    year: 2024,
    trim: "xDrive",
    mileage: 3200,
    price: 78900,
    status: "live",
    vinSuffix: "…8F2A",
  },
  {
    id: "2",
    make: "Mercedes-Benz",
    model: "E 450",
    year: 2023,
    trim: "4MATIC Sedan",
    mileage: 18400,
    price: 54950,
    status: "live",
    vinSuffix: "…K91C",
  },
  {
    id: "3",
    make: "Porsche",
    model: "911 Carrera S",
    year: 2022,
    trim: "Sport Chrono",
    mileage: 8900,
    price: 132500,
    status: "draft",
    vinSuffix: "…3D7E",
  },
  {
    id: "4",
    make: "Audi",
    model: "RS 6 Avant",
    year: 2024,
    trim: "Carbon Optic",
    mileage: 1200,
    price: 124800,
    status: "sold",
    vinSuffix: "…Q44B",
  },
  {
    id: "5",
    make: "Lexus",
    model: "LC 500",
    year: 2023,
    trim: "Inspiration Series",
    mileage: 5600,
    price: 97800,
    status: "live",
    vinSuffix: "…T88M",
  },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatMileage(n: number) {
  return new Intl.NumberFormat("en-US").format(n) + " mi";
}

function statusBadgeClass(s: ListingStatus) {
  if (s === "live") return styles.badgeLive;
  if (s === "draft") return styles.badgeDraft;
  return styles.badgeSold;
}

function makeEmoji(make: string) {
  const m = make.toLowerCase();
  if (m.includes("bmw")) return "◆";
  if (m.includes("mercedes")) return "◇";
  if (m.includes("porsche")) return "▲";
  if (m.includes("audi")) return "◎";
  if (m.includes("lexus")) return "◉";
  return "◈";
}

export default function CarInventoryPage() {
  const [listings, setListings] = useState<CarListing[]>(initialListings);
  const [modalOpen, setModalOpen] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [trim, setTrim] = useState("");
  const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ListingStatus>("draft");

  const stats = useMemo(() => {
    const live = listings.filter((c) => c.status === "live").length;
    const totalValue = listings
      .filter((c) => c.status !== "sold")
      .reduce((a, c) => a + c.price, 0);
    return { count: listings.length, live, totalValue };
  }, [listings]);

  function openModal() {
    setMake("");
    setModel("");
    setYear(String(new Date().getFullYear()));
    setTrim("");
    setMileage("");
    setPrice("");
    setStatus("draft");
    setModalOpen(true);
  }

  function addListing(e: FormEvent) {
    e.preventDefault();
    const y = parseInt(year, 10);
    const mi = parseInt(mileage.replace(/\D/g, ""), 10) || 0;
    const pr = parseInt(price.replace(/\D/g, ""), 10) || 0;
    if (!make.trim() || !model.trim() || !y) return;

    const id = crypto.randomUUID?.() ?? String(Date.now());
    const vinSuffix = "…" + id.slice(-4).toUpperCase();

    setListings((prev) => [
      {
        id,
        make: make.trim(),
        model: model.trim(),
        year: y,
        trim: trim.trim() || "—",
        mileage: mi,
        price: pr,
        status,
        vinSuffix,
      },
      ...prev,
    ]);
    setModalOpen(false);
  }

  function removeListing(id: string) {
    setListings((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1>Inventory</h1>
            <p>Manage listings, pricing, and status from one refined workspace.</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btnPrimary} onClick={openModal}>
              <span aria-hidden>+</span>
              Add new car
            </button>
          </div>
        </header>

        <section className={styles.stats} aria-label="Summary">
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total listings</div>
            <div className={styles.statValue}>{stats.count}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Live on lot</div>
            <div className={styles.statValue}>{stats.live}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Active inventory value</div>
            <div className={styles.statValue}>{formatPrice(stats.totalValue)}</div>
          </div>
        </section>

        <section className={styles.tableWrap} aria-labelledby="listings-heading">
          <div className={styles.tableHead}>
            <h2 id="listings-heading">Current listings</h2>
            <span className={styles.count}>{listings.length} vehicles</span>
          </div>
          <div className={styles.scroll}>
            {listings.length === 0 ? (
              <div className={styles.empty}>
                <strong>No vehicles yet</strong>
                <p>Use &quot;Add new car&quot; to create your first listing.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Year</th>
                    <th>Mileage</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>VIN</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {listings.map((car) => (
                    <tr key={car.id}>
                      <td>
                        <div className={styles.vehicleCell}>
                          <div className={styles.thumb} aria-hidden>
                            {makeEmoji(car.make)}
                          </div>
                          <div className={styles.vehicleMeta}>
                            <strong>
                              {car.make} {car.model}
                            </strong>
                            <span>{car.trim}</span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.mono}>{car.year}</td>
                      <td className={styles.mono}>{formatMileage(car.mileage)}</td>
                      <td className={`${styles.mono} ${styles.price}`}>{formatPrice(car.price)}</td>
                      <td>
                        <span className={`${styles.badge} ${statusBadgeClass(car.status)}`}>
                          {car.status === "live"
                            ? "Live"
                            : car.status === "draft"
                              ? "Draft"
                              : "Sold"}
                        </span>
                      </td>
                      <td className={styles.mono}>{car.vinSuffix}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title="Remove listing"
                            aria-label={`Remove ${car.make} ${car.model}`}
                            onClick={() => removeListing(car.id)}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {modalOpen && (
        <div
          className={styles.overlay}
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className={styles.modalHead}>
              <div>
                <h3 id="modal-title">Add vehicle</h3>
                <p>Details appear in your inventory table immediately.</p>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setModalOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <form className={styles.form} onSubmit={addListing}>
              <div className={styles.field}>
                <label htmlFor="make">Make</label>
                <input id="make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. BMW" required />
              </div>
              <div className={styles.field}>
                <label htmlFor="model">Model</label>
                <input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. M4 Competition" required />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="year">Year</label>
                  <input id="year" type="number" min={1990} max={2030} value={year} onChange={(e) => setYear(e.target.value)} required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="status">Status</label>
                  <select id="status" value={status} onChange={(e) => setStatus(e.target.value as ListingStatus)}>
                    <option value="draft">Draft</option>
                    <option value="live">Live</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="trim">Trim / package</label>
                <input id="trim" value={trim} onChange={(e) => setTrim(e.target.value)} placeholder="Optional" />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="mileage">Mileage</label>
                  <input id="mileage" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="0" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="price">Price (USD)</label>
                  <input id="price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
