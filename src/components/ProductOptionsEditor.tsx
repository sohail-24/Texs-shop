import React, { useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { formatCurrency, toNumber } from "@/lib/i18n";
import { uploadProductImage, resolveProductImageUrl } from "@/lib/image";
import type { ProductOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Flame, ImagePlus, Layers, Plus, Sparkles, Trash2, UploadCloud, Utensils, X } from "lucide-react";

interface ProductOptionsEditorProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
  basePrice?: number | string;
  onBasePriceChange?: (price: string) => void;
}

export function ProductOptionsEditor({
  options,
  onChange,
  basePrice,
  onBasePriceChange,
}: ProductOptionsEditorProps) {
  const [uploadingOptionId, setUploadingOptionId] = useState<string | null>(null);

  const handleImageUpload = async (optionId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPEG, WebP).");
      return;
    }
    setUploadingOptionId(optionId);
    try {
      const url = await uploadProductImage(file);
      updateOption(optionId, { image: url });
      toast.success("Variant image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload variant image.");
    } finally {
      setUploadingOptionId(null);
    }
  };

  const addOption = () => {
    const newOption: ProductOption = {
      id: nanoid(6),
      name: `Option ${options.length + 1}`,
      price: toNumber(basePrice) || 9.99,
      compareAtPrice: null,
      mealPrice: null,
      onlyPrice: null,
      image: null,
      includedWith: null,
    };
    onChange([...options, newOption]);
  };

  const updateOption = (id: string, updates: Partial<ProductOption>) => {
    const next = options.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt));
    onChange(next);
  };

  const removeOption = (id: string) => {
    onChange(options.filter((opt) => opt.id !== id));
  };

  const applyPreset = (presetName: string) => {
    let presetOptions: ProductOption[] = [];
    if (presetName === "signature-chicken") {
      presetOptions = [
        { id: nanoid(6), name: "2 PC", price: 7.49, mealPrice: 10.49, onlyPrice: 7.49 },
        { id: nanoid(6), name: "3 PC", price: 9.49, mealPrice: 12.49, onlyPrice: 9.49 },
        { id: nanoid(6), name: "4 PC", price: 11.49, mealPrice: 14.49, onlyPrice: 11.49 },
      ];
    } else if (presetName === "fiery-wings") {
      presetOptions = [
        { id: nanoid(6), name: "6 PC", price: 8.99, mealPrice: 11.99, onlyPrice: 8.99 },
        { id: nanoid(6), name: "15 PC", price: 19.99, mealPrice: 22.99, onlyPrice: 19.99 },
      ];
    } else if (presetName === "sandwich") {
      presetOptions = [
        { id: nanoid(6), name: "Classic", price: 6.99, mealPrice: 9.99, onlyPrice: 6.99 },
        { id: nanoid(6), name: "Deluxe", price: 7.99, mealPrice: 10.99, onlyPrice: 7.99 },
        { id: nanoid(6), name: "Grilled", price: 8.49, mealPrice: 11.49, onlyPrice: 8.49 },
      ];
    } else if (presetName === "tenders") {
      presetOptions = [
        { id: nanoid(6), name: "3 PC", price: 6.49, mealPrice: 9.49, onlyPrice: 6.49 },
        { id: nanoid(6), name: "5 PC", price: 9.99, mealPrice: 12.99, onlyPrice: 9.99 },
      ];
    } else if (presetName === "meal-only") {
      presetOptions = [
        { id: nanoid(6), name: "Regular Order", price: 7.99, mealPrice: 10.99, onlyPrice: 7.99 },
      ];
    }

    if (presetOptions.length > 0) {
      onChange(presetOptions);
      if (onBasePriceChange && presetOptions[0]) {
        onBasePriceChange(String(presetOptions[0].price));
      }
    }
  };

  return (
    <Card className="border-emerald-200/60 bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Layers className="h-4 w-4 text-emerald-600" />
                Multiple Price Options & Product Variants
              </CardTitle>
              {options.length > 0 ? (
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-50/50 text-[11px] font-normal py-0 h-5">
                  Variant Mode Active ({options.length} {options.length === 1 ? "Option" : "Options"})
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px] font-normal py-0 h-5">
                  Standard Mode
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              {options.length > 0
                ? "Variant Mode is active. Variant pricing and the first variant image serve as the product's primary price and photo."
                : "Configure multiple options (e.g. 2 PC, 3 PC, 4 PC or SM/LG) to activate Variant Mode."}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 shrink-0"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>

        {/* Quick Menu Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Quick Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("signature-chicken")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Signature (2, 3, 4 PC)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("fiery-wings")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Wings (6, 15 PC)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("sandwich")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Sandwiches (Classic, Deluxe)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("tenders")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Tenders (3, 5 PC)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("meal-only")}
            className="text-[11px] bg-muted/60 hover:bg-muted text-foreground px-2 py-0.5 rounded border border-border transition-colors"
          >
            Meal vs Only
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {options.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-6 text-center">
            <Utensils className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Single Standard Price (No Variants)</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Currently this item has one standard price. If this dish comes in multiple portions or sizes (like 2 PC / 3 PC / 4 PC), click &ldquo;Add Option&rdquo; or pick a preset above.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-3 text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Enable Multiple Options
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{options.length} {options.length === 1 ? "Option" : "Options"} Defined</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-destructive hover:underline text-[11px]"
              >
                Clear all options (revert to single price)
              </button>
            </div>

            <div className="space-y-2.5">
              {options.map((opt, index) => (
                <div
                  key={opt.id}
                  className="rounded-lg border border-border bg-card p-3 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        Option #{index + 1}
                      </span>
                      {index === 0 && (
                        <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 h-4">
                          Default Product Image
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOption(opt.id)}
                      title="Remove option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                    {/* Variant Image Area */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 w-28 sm:w-32">
                      <div className="relative aspect-square w-28 h-28 sm:w-32 sm:h-32 rounded-lg border border-border bg-muted/20 overflow-hidden flex items-center justify-center group">
                        {opt.image ? (
                          <>
                            <img
                              src={resolveProductImageUrl(opt.image)}
                              alt={opt.name || "Variant image"}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                updateOption(opt.id, { image: null });
                              }}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground text-muted-foreground flex items-center justify-center shadow-xs transition-colors"
                              title="Remove variant image"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            {index === 0 && (
                              <div className="absolute inset-x-0 bottom-0 bg-emerald-700/90 py-0.5 text-center text-[9px] font-semibold text-white">
                                Default Store Image
                              </div>
                            )}
                          </>
                        ) : index === 0 ? (
                          <label
                            htmlFor={`opt-file-${opt.id}`}
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-2 text-center hover:bg-muted/40 transition-colors"
                          >
                            <ImagePlus className="h-6 w-6 text-emerald-600 mb-1" />
                            <span className="text-[10px] text-emerald-700 font-semibold">Upload Default Photo</span>
                            <span className="text-[9px] text-muted-foreground/80">Used on Home & Catalog</span>
                          </label>
                        ) : (
                          <label
                            htmlFor={`opt-file-${opt.id}`}
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-2 text-center hover:bg-muted/40 transition-colors"
                          >
                            <ImagePlus className="h-6 w-6 text-muted-foreground/50 mb-1" />
                            <span className="text-[10px] text-muted-foreground font-medium">No variant image</span>
                            <span className="text-[9px] text-muted-foreground/70">Falls back to Option #1</span>
                          </label>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        id={`opt-file-${opt.id}`}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={uploadingOptionId === opt.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(opt.id, file);
                          e.target.value = "";
                        }}
                      />

                      {/* Upload / Change Image Label Button */}
                      <label
                        htmlFor={`opt-file-${opt.id}`}
                        className={`w-full cursor-pointer inline-flex items-center justify-center rounded-md text-[11px] font-medium border border-input bg-background hover:bg-muted h-7 px-2 transition-colors ${
                          uploadingOptionId === opt.id ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {uploadingOptionId === opt.id ? (
                          <>
                            <span className="h-3 w-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-1.5" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="mr-1 h-3 w-3 shrink-0 text-emerald-600" />
                            {opt.image ? "Change Image" : "Upload Image"}
                          </>
                        )}
                      </label>
                    </div>

                    {/* Inputs Grid */}
                    <div className="flex-1 min-w-0 space-y-3 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[11px] font-bold text-foreground">Option Label *</Label>
                          <Input
                            value={opt.name}
                            onChange={(e) => updateOption(opt.id, { name: e.target.value })}
                            placeholder="e.g. SM, 2 PC, Classic"
                            className="h-8 text-xs font-medium mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] font-normal text-muted-foreground">What Comes With It</Label>
                          <Input
                            value={opt.includedWith ?? ""}
                            onChange={(e) => updateOption(opt.id, { includedWith: e.target.value })}
                            placeholder="e.g. With Fries and Juice"
                            className="h-8 text-xs mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[11px] font-bold text-foreground">Primary Price ($) *</Label>
                          <div className="relative mt-1">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={opt.price ?? ""}
                              onChange={(e) =>
                                updateOption(opt.id, { price: e.target.value ? Number(e.target.value) : 0 })
                              }
                              placeholder="9.99"
                              className="h-8 text-xs font-medium pl-6"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-[11px] font-normal text-muted-foreground">Combo Meal Price ($)</Label>
                          <div className="relative mt-1">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={opt.mealPrice ?? ""}
                              onChange={(e) =>
                                updateOption(opt.id, {
                                  mealPrice: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              placeholder="Optional (e.g. 12.99)"
                              className="h-8 text-xs pl-6"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-[11px] font-normal text-muted-foreground">Only Price ($)</Label>
                          <div className="relative mt-1">
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={opt.onlyPrice ?? ""}
                              onChange={(e) =>
                                updateOption(opt.id, {
                                  onlyPrice: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              placeholder="Optional (e.g. 8.99)"
                              className="h-8 text-xs pl-6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Storefront Customer View Summary */}
            <div className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Storefront Customer Experience:
              </p>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400 mt-1">
                Customers on the product page will see radio selection buttons for each option (
                {options.map((o) => `${o.name}${o.includedWith ? ` [${o.includedWith}]` : ''}: ${formatCurrency(o.price)}`).join(", ")}) and cannot add the item to cart without selecting their option.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
