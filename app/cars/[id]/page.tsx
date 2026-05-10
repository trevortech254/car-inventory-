"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../../CarInventory.module.css";
import { seedCars } from "../../../lib/cars";

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

export default function CarDetailPage() {
  const params = useParams<{ id: string }>();
  const [showContact, setShowContact] = useState(false);
  const car = useMemo(() => seedCars.find((item) => item.id === params.id), [params.id]);

  if (!car) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.tableWrap} style={{ padding: "1.25rem" }}>
            <h1>Car not found</h1>
            <p>This listing is no longer available.</p>
            <Link href="/" className={styles.btnGhostLink}>
              Back to marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const carName = `${car.year} ${car.make} ${car.model}`;
  const whatsappMessage = encodeURIComponent(`Iam interestedin the ${carName}`);
  const whatsappUrl = `https://wa.me/${car.dealerPhone}?text=${whatsappMessage}`;
  const phoneLabel = `+${car.dealerPhone}`;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <h1>{carName}</h1>
            <p>{car.trim} · VIN {car.vinSuffix} · Listed by {car.dealerName}</p>
          </div>
          <div className={styles.actions}>
            <Link href="/" className={styles.btnGhostLink}>
              Back to marketplace
            </Link>
          </div>
        </header>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Price</div>
            <div className={styles.statValue}>{formatPrice(car.price)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Mileage</div>
            <div className={styles.statValue}>{formatMileage(car.mileage)}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Status</div>
            <div className={styles.statValue} style={{ textTransform: "capitalize" }}>
              {car.status}
            </div>
          </div>
        </section>

        <section className={styles.tableWrap} style={{ padding: "1.25rem" }}>
          <h2 style={{ marginTop: 0 }}>Dealer contact</h2>
          <p className={styles.contactLead}>Use direct contact actions to reach this dealer quickly.</p>
          <button type="button" className={styles.btnPrimary} onClick={() => setShowContact((prev) => !prev)}>
            Contact dealer
          </button>

          {showContact && (
            <div className={styles.contactPanel}>
              <p>
                Phone number: <strong>{phoneLabel}</strong>
              </p>
              <div className={styles.contactActions}>
                <a className={styles.btnPrimaryLink} href={whatsappUrl} target="_blank" rel="noreferrer">
                  Open WhatsApp
                </a>
                <a className={`${styles.btnGhostLink} ${styles.mobileCallOnly}`} href={`tel:+${car.dealerPhone}`}>
                  Call dealer (mobile)
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
