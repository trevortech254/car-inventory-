import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Inventory · Vehicle listings",
  description: "Manage vehicle inventory and listings.",
  verification: {
    google: "k8m8AF9QIj8Q8cRXRrjhtykqZvN9yoZL1_UgNkU_btY",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
