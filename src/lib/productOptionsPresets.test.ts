import { describe, it, expect } from "vitest";
import { getPresetOptions } from "@/components/ProductOptionsEditor";

describe("Product Options Quick Presets", () => {
  it("preserves existing presets untouched", () => {
    const signature = getPresetOptions("signature-chicken");
    expect(signature).toHaveLength(3);
    expect(signature.map((s) => s.name)).toEqual(["2 PC", "3 PC", "4 PC"]);

    const wings = getPresetOptions("fiery-wings");
    expect(wings).toHaveLength(2);
    expect(wings.map((w) => w.name)).toEqual(["6 PC", "15 PC"]);

    const sandwiches = getPresetOptions("sandwich");
    expect(sandwiches).toHaveLength(3);
    expect(sandwiches.map((s) => s.name)).toEqual(["Classic", "Deluxe", "Grilled"]);

    const tenders = getPresetOptions("tenders");
    expect(tenders).toHaveLength(2);
    expect(tenders.map((t) => t.name)).toEqual(["3 PC", "5 PC"]);

    const mealOnly = getPresetOptions("meal-only");
    expect(mealOnly).toHaveLength(1);
    expect(mealOnly[0].name).toBe("Regular Order");
  });

  it("does not provide Mild or Spicy as presets", () => {
    expect(getPresetOptions("mild")).toEqual([]);
    expect(getPresetOptions("spicy")).toEqual([]);
  });
});
