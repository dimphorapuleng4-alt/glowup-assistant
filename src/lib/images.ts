import braids from "@/assets/braids.jpg";
import lashes from "@/assets/lashes.jpg";
import nails from "@/assets/nails.jpg";
import products from "@/assets/products.jpg";
import salon from "@/assets/salon.jpg";
import styling from "@/assets/styling.jpg";
import wigs from "@/assets/wigs.jpg";

export const salonImages = {
  braids,
  lashes,
  nails,
  products,
  salon,
  styling,
  wigs,
} as const;

export type SalonImageKey = keyof typeof salonImages;

export const imageKeys = Object.keys(salonImages) as SalonImageKey[];

export function imageFor(key: string | null | undefined) {
  if (key && key in salonImages) return salonImages[key as SalonImageKey];
  return salonImages.salon;
}

export const imageAlt: Record<SalonImageKey, string> = {
  braids: "Client with long knotless braids in a pink salon",
  lashes: "Close-up of volume eyelash extensions",
  nails: "Soft pink manicured nails with sparkle detail",
  products: "Flat lay of pink and white beauty products",
  salon: "Modern pink and white beauty salon interior",
  styling: "Hair styling tools and glossy hair on a marble counter",
  wigs: "Glossy wavy hair bundles on pink silk",
};
