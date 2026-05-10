import HomePageClient from "./HomePageClient";
import { fetchMarketplaceListings } from "../lib/marketplaceListings";

export default async function Page() {
  const initialListings = await fetchMarketplaceListings();
  return <HomePageClient initialListings={initialListings} />;
}
