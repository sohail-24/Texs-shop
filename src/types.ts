export type ProductOptionChoiceGroup = {
  label: string;
  choices: string[];
};

export type ProductOption = {
  id: string;
  name: string; // e.g. "2 PC", "3 PC", "4 PC", "Small", "Regular", "Classic"
  price: number; // Primary selling price
  compareAtPrice?: number | null; // Optional original/compare price
  mealPrice?: number | null; // Optional MEAL price
  onlyPrice?: number | null; // Optional ONLY price
  image?: string | null; // Variant specific image
  includedWith?: string | null; // Variant specific "What Comes With It"
  choiceGroup?: ProductOptionChoiceGroup;
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
        const choiceGroupLabel = typeof item.choiceGroup?.label === "string" ? item.choiceGroup.label.trim() : "";
        const choiceGroupChoices = Array.isArray(item.choiceGroup?.choices)
          ? item.choiceGroup.choices.filter((choice: unknown): choice is string => typeof choice === "string").map((choice: string) => choice.trim()).filter(Boolean)
          : [];
        const choiceGroup = choiceGroupLabel && choiceGroupChoices.length > 0
          ? { label: choiceGroupLabel, choices: choiceGroupChoices }
          : undefined;
        
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
          choiceGroup,
        } as ProductOption;
      })
      .filter((opt): opt is ProductOption => opt !== null);
  } catch {
    return [];
  }
}
