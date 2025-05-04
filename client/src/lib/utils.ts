import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type GenderType = "men" | "women";

export type FragranceType = "fresh" | "floral" | "woody" | "oriental";

export type AgeRange = "18-24" | "25-34" | "35-44" | "45+";

export type Occasion = "everyday" | "work" | "date" | "special";

export type UserPreferences = {
  gender?: GenderType;
  ageRange?: AgeRange;
  fragranceTypes?: FragranceType[];
  occasions?: Occasion[];
  intensity?: number;
  budget?: string;
  notes?: string;
};

export type Perfume = {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  matchPercentage: number;
  gender: GenderType[];
  fragranceType: FragranceType[];
  occasions: Occasion[];
  imageUrl: string;
};

export const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`;
}

export const formatMatch = (match: number) => {
  return `${match}% Match`;
}
