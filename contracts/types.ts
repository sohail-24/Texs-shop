export type * from "../db/schema";
export * from "./errors";

export type ProductOption = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  mealPrice?: number | null;
  onlyPrice?: number | null;
  image?: string | null;
  includedWith?: string | null;
};

export const ProductOption = {} as unknown as ProductOption;

export function parseProductOptions(value?: unknown): ProductOption[] {
  if (!value) return [];
  try {
    const raw = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item: any, idx: number) => {
        if (!item || typeof item !== "object") return null;
        const name = String(item.name || "").trim();
        const price = Number(item.price ?? item.sellingPrice ?? 0);
        const mealPrice = item.mealPrice != null && Number(item.mealPrice) > 0 ? Number(item.mealPrice) : null;
        const onlyPrice = item.onlyPrice != null && Number(item.onlyPrice) > 0 ? Number(item.onlyPrice) : null;
        const compareAtPrice = item.compareAtPrice != null && Number(item.compareAtPrice) > 0 ? Number(item.compareAtPrice) : null;
        const image = typeof item.image === "string" && item.image.trim() ? item.image.trim() : null;
        const includedWith = typeof item.includedWith === "string" && item.includedWith.trim() ? item.includedWith.trim() : null;
        
        if (!name && price <= 0 && !mealPrice && !onlyPrice) return null;

        return {
          id: item.id ? String(item.id) : `opt-${idx + 1}-${Date.now()}`,
          name: name || `Option ${idx + 1}`,
          price: isNaN(price) ? (mealPrice || onlyPrice || 0) : price,
          compareAtPrice,
          mealPrice,
          onlyPrice,
          image,
          includedWith,
        } as ProductOption;
      })
      .filter((opt): opt is ProductOption => opt !== null);
  } catch {
    return [];
  }
}

