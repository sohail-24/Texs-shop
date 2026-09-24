import { describe, it, expect } from "vitest";
import { getPresetOptions } from "@/components/ProductOptionsEditor";

describe("Product Options Quick Presets", () => {
  it("generates Mild preset with correct option structure", () => {
    const mildOptions = getPresetOptions("mild");
    expect(mildOptions).toHaveLength(1);
    expect(mildOptions[0].name).toBe("Mild");
    expect(mildOptions[0].price).toBe(7.99);
    expect(mildOptions[0].mealPrice).toBe(10.99);
    expect(mildOptions[0].onlyPrice).toBe(7.99);
    expect(mildOptions[0].id).toBeDefined();
  });

  it("generates Mild preset using provided base price", () => {
    const mildOptions = getPresetOptions("mild", "9.50");
    expect(mildOptions).toHaveLength(1);
    expect(mildOptions[0].name).toBe("Mild");
    expect(mildOptions[0].price).toBe(9.5);
    expect(mildOptions[0].mealPrice).toBe(12.5);
    expect(mildOptions[0].onlyPrice).toBe(9.5);
  });

  it("generates Spicy preset with correct option structure", () => {
    const spicyOptions = getPresetOptions("spicy");
    expect(spicyOptions).toHaveLength(1);
    expect(spicyOptions[0].name).toBe("Spicy");
    expect(spicyOptions[0].price).toBe(7.99);
    expect(spicyOptions[0].mealPrice).toBe(10.99);
    expect(spicyOptions[0].onlyPrice).toBe(7.99);
    expect(spicyOptions[0].id).toBeDefined();
  });

  it("generates Spicy preset using provided base price", () => {
    const spicyOptions = getPresetOptions("spicy", "11.25");
    expect(spicyOptions).toHaveLength(1);
    expect(spicyOptions[0].name).toBe("Spicy");
    expect(spicyOptions[0].price).toBe(11.25);
    expect(spicyOptions[0].mealPrice).toBe(14.25);
    expect(spicyOptions[0].onlyPrice).toBe(11.25);
  });

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
});
