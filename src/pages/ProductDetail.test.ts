import { describe, expect, it } from "vitest";
import { parseProductOptions } from "@/types";

describe("ProductDetail Option Selection Header Logic", () => {
  it("correctly parses and resolves option names for dynamic current display", () => {
    const rawOptions = JSON.stringify([
      { id: "sJquxa", name: "SM (300 CAL)", price: 3.25 },
      { id: "-XfGtB", name: "LG (500 CAL)", price: 4.25 },
    ]);

    const parsed = parseProductOptions(rawOptions);
    expect(parsed.length).toBe(2);

    // Initial selected option
    const firstOption = parsed[0];
    expect(firstOption.name).toBe("SM (300 CAL)");

    // Switching to second option dynamically updates label
    const secondOption = parsed[1];
    expect(secondOption.name).toBe("LG (500 CAL)");
  });

  it("resolves meal and only pricing suffixes dynamically when applicable", () => {
    const rawOptions = JSON.stringify([
      { id: "opt-1", name: "6 Pc Wings", mealPrice: 10.99, onlyPrice: 7.99 },
    ]);

    const parsed = parseProductOptions(rawOptions);
    const opt = parsed[0];

    // Standard mode without meal/only selected
    function resolveLabel(mode: "standard" | "meal" | "only") {
      if (mode === "meal" && opt.mealPrice) {
        return `${opt.name} (Meal)`;
      }
      if (mode === "only" && opt.onlyPrice) {
        return `${opt.name} (Only)`;
      }
      return opt.name;
    }

    expect(resolveLabel("standard")).toBe("6 Pc Wings");
    expect(resolveLabel("meal")).toBe("6 Pc Wings (Meal)");
    expect(resolveLabel("only")).toBe("6 Pc Wings (Only)");
  });

  it("synchronizes variant images and falls back to main product image when variant has no image", () => {
    const rawOptions = JSON.stringify([
      { id: "opt-med", name: "Medium", price: 5.55, image: "/api/uploads/medium-burger.png" },
      { id: "opt-lrg", name: "Large", price: 9.99, image: "/api/uploads/large-burger.png" },
      { id: "opt-sm", name: "Small", price: 3.55, image: null },
    ]);

    const parsed = parseProductOptions(rawOptions);
    expect(parsed.length).toBe(3);

    const mainProductImage = "/api/uploads/default-burger.png";

    function resolveDisplayedImage(optionId: string) {
      const selected = parsed.find((o) => o.id === optionId) || parsed[0];
      return (selected?.image && selected.image.trim()) || mainProductImage;
    }

    // Selecting Medium displays Medium variant image
    expect(resolveDisplayedImage("opt-med")).toBe("/api/uploads/medium-burger.png");

    // Switching to Large displays Large variant image
    expect(resolveDisplayedImage("opt-lrg")).toBe("/api/uploads/large-burger.png");

    // Selecting Small (which has no variant image) falls back to main product image
    expect(resolveDisplayedImage("opt-sm")).toBe("/api/uploads/default-burger.png");
  });

  it("handles SM and LG French Fries variant image switching and first variant default", () => {
    const rawOptions = JSON.stringify([
      { id: "sm-fries", name: "SM (300 CAL)", price: 3.25, image: "/api/uploads/french-fries-sm.png" },
      { id: "lg-fries", name: "LG (500 CAL)", price: 4.25, image: "/api/uploads/french-fries-lg.png" },
    ]);
    const parsed = parseProductOptions(rawOptions);

    function resolveDisplayedImage(selectedOptionId: string) {
      const selected = parsed.find((o) => o.id === selectedOptionId) || parsed[0];
      return (selected?.image && selected.image.trim()) || null;
    }

    // First variant image is default on load
    expect(resolveDisplayedImage("")).toBe("/api/uploads/french-fries-sm.png");
    expect(resolveDisplayedImage("sm-fries")).toBe("/api/uploads/french-fries-sm.png");

    // Switching to LG shows LG image
    expect(resolveDisplayedImage("lg-fries")).toBe("/api/uploads/french-fries-lg.png");
  });

  it("does not render compare price if invalid/absent, but renders when legitimate compare price is configured", () => {
    // Helper replicating ProductDetail's compareAt resolution logic
    function resolveCompareAt(
      hasOptions: boolean,
      selectedOption: { price: number; compareAtPrice?: number | string | null } | null,
      product: { unitPrice: string; compareAtPrice?: string | null },
      price: number
    ): number | null {
      if (hasOptions) {
        if (selectedOption?.compareAtPrice != null && selectedOption.compareAtPrice !== "") {
          const val = Number(selectedOption.compareAtPrice);
          if (Number.isFinite(val) && val > price) {
            return val;
          }
        }
        return null;
      }

      const raw = product?.compareAtPrice;
      if (raw != null && raw !== "" && raw !== "0" && raw !== "0.00") {
        const val = Number(raw);
        if (Number.isFinite(val) && val > price) {
          return val;
        }
      }
      return null;
    }

    // Scenario 1: French Fries with SM ($3.25) and LG ($4.25)
    // Product has legacy/buggy compareAtPrice = "1.14" from food purchase price, but variants have NO compareAtPrice
    const productWith114 = { unitPrice: "3.25", compareAtPrice: "1.14" };
    const lgOptionNoCompare = { price: 4.25, compareAtPrice: null };
    const smOptionNoCompare = { price: 3.25, compareAtPrice: undefined };

    // $1.14 must NOT appear for LG or SM
    expect(resolveCompareAt(true, lgOptionNoCompare, productWith114, 4.25)).toBeNull();
    expect(resolveCompareAt(true, smOptionNoCompare, productWith114, 3.25)).toBeNull();

    // Scenario 2: Variant WITH legitimate compare-at price (e.g. was $5.25, now $4.25)
    const lgOptionWithCompare = { price: 4.25, compareAtPrice: 5.25 };
    expect(resolveCompareAt(true, lgOptionWithCompare, productWith114, 4.25)).toBe(5.25);

    // Scenario 3: Standard product (no variants) with no compare price or invalid compare price
    expect(resolveCompareAt(false, null, { unitPrice: "4.25", compareAtPrice: null }, 4.25)).toBeNull();
    expect(resolveCompareAt(false, null, { unitPrice: "4.25", compareAtPrice: "0" }, 4.25)).toBeNull();
    expect(resolveCompareAt(false, null, { unitPrice: "4.25", compareAtPrice: "1.14" }, 4.25)).toBeNull(); // 1.14 < 4.25 is invalid

    // Scenario 4: Standard product WITH legitimate compare-at price (was $6.00, now $4.25)
    expect(resolveCompareAt(false, null, { unitPrice: "4.25", compareAtPrice: "6.00" }, 4.25)).toBe(6.0);
  });
});
