export type ListingStatus = "live" | "draft" | "sold";

export type MarketplaceCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  mileage: number;
  price: number;
  status: ListingStatus;
  vinSuffix: string;
  dealerName: string;
  dealerPhone: string;
};

export const seedCars: MarketplaceCar[] = [
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
    dealerName: "Northline Motors",
    dealerPhone: "15551234567",
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
    dealerName: "City Auto Hub",
    dealerPhone: "15559876543",
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
    dealerName: "Prime Luxury Cars",
    dealerPhone: "15557654321",
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
    dealerName: "Autoline Performance",
    dealerPhone: "15552349876",
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
    dealerName: "Bluewave Autos",
    dealerPhone: "15553456789",
  },
];
