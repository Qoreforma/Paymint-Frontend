import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchSmmPlatforms, 
  fetchSmmProductTypes, 
  fetchSmmProducts, 
  ISmmPlatform, 
  ISmmProduct 
} from "@/lib/api/dashboard-apis/servicesApis";
import useSmmStore from "@/stores/useSmmStore";
import CustomButton from "@/components/CustomButton";
import { formatAmount } from "@/lib/utils";
import { Loader2, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const RecipientDetails = () => {
  const {
    platform,
    platformName,
    productType,
    productId,
    link,
    quantity,
    update,
  } = useSmmStore();

  const [inputLink, setInputLink] = useState(link || "");
  const [inputQuantity, setInputQuantity] = useState<string>(quantity ? quantity.toString() : "");

  // 1. Fetch Platforms
  const { data: platforms = [], isLoading: loadingPlatforms } = useQuery<ISmmPlatform[]>({
    queryKey: ["smm-platforms"],
    queryFn: fetchSmmPlatforms,
  });

  // Auto-select first platform if none selected
  useEffect(() => {
    if (platforms.length > 0 && !platform) {
      const first = platforms[0];
      update({
        platform: first.code,
        platformName: first.name,
        platformLogo: first.logo || "",
      });
    }
  }, [platforms, platform, update]);

  // 2. Fetch Product Types for chosen platform
  const { data: productTypes = [], isLoading: loadingTypes } = useQuery<string[]>({
    queryKey: ["smm-product-types", platform],
    queryFn: () => fetchSmmProductTypes(platform),
    enabled: !!platform,
  });

  // Auto-select first product type or "All"
  useEffect(() => {
    if (productTypes.length > 0 && !productType) {
      update({ productType: productTypes[0] });
    }
  }, [productTypes, productType, update]);

  // 3. Fetch Products for chosen platform and productType
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["smm-products", platform, productType],
    queryFn: () => fetchSmmProducts(platform, productType),
    enabled: !!platform,
  });

  const products: ISmmProduct[] = productsData?.products || [];

  // Selected product object
  const selectedProduct = useMemo(() => {
    return products.find((p) => (p._id || p.id) === productId) || (products.length > 0 ? products[0] : null);
  }, [products, productId]);

  // Sync selected product to store
  useEffect(() => {
    if (selectedProduct) {
      const min = Number(selectedProduct.attributes?.min) || 10;
      const max = Number(selectedProduct.attributes?.max) || 100000;
      update({
        productId: selectedProduct._id || selectedProduct.id || "",
        productName: selectedProduct.name,
        productRate: selectedProduct.amount,
        minQuantity: min,
        maxQuantity: max,
      });
    }
  }, [selectedProduct, update]);

  const numQty = parseInt(inputQuantity) || 0;
  const minQty = selectedProduct ? (Number(selectedProduct.attributes?.min) || 10) : 10;
  const maxQty = selectedProduct ? (Number(selectedProduct.attributes?.max) || 100000) : 100000;
  const rate = selectedProduct?.amount || 0;
  const calculatedTotal = numQty > 0 ? Math.round((rate / 1000) * numQty * 100) / 100 : 0;

  const isQtyValid = numQty >= minQty && numQty <= maxQty;
  const isFormValid = !!platform && !!selectedProduct && !!inputLink.trim() && isQtyValid;

  const handlePlatformSelect = (p: ISmmPlatform) => {
    update({
      platform: p.code,
      platformName: p.name,
      platformLogo: p.logo || "",
      productType: "",
      productId: "",
      productName: "",
      productRate: 0,
    });
  };

  const handleProductTypeSelect = (type: string) => {
    update({
      productType: type,
      productId: "",
      productName: "",
    });
  };

  const handleProductSelect = (pId: string) => {
    const prod = products.find((p) => (p._id || p.id) === pId);
    if (prod) {
      const min = Number(prod.attributes?.min) || 10;
      const max = Number(prod.attributes?.max) || 100000;
      update({
        productId: prod._id || prod.id || "",
        productName: prod.name,
        productRate: prod.amount,
        minQuantity: min,
        maxQuantity: max,
      });
    }
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink.trim()) {
      toast.error("Please enter a target social profile or post link.");
      return;
    }
    if (!isQtyValid) {
      toast.error(`Quantity must be between ${minQty.toLocaleString()} and ${maxQty.toLocaleString()}.`);
      return;
    }

    update({
      link: inputLink.trim(),
      quantity: numQty,
      amount: calculatedTotal,
      step: 2,
    });
  };

  return (
    <form onSubmit={handleProceed} className="w-full flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-display font-semibold text-slate-900">
          Social Media Marketing
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Boost your followers, likes, views, and engagement across top social platforms.
        </p>
      </div>

      {/* 1. Platform Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Select Platform
        </label>
        {loadingPlatforms ? (
          <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
            <Loader2 className="size-4 animate-spin text-blue-600" />
            Loading platforms...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {platforms.map((p) => {
              const isSelected = platform === p.code;
              return (
                <button
                  type="button"
                  key={p.code}
                  onClick={() => handlePlatformSelect(p)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="size-8 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0 p-1">
                    {p.logo ? (
                      <img src={p.logo} alt={p.name} className="size-6 object-contain" />
                    ) : (
                      <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium truncate ${isSelected ? "text-blue-900 font-semibold" : "text-slate-700"}`}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Product Category / Type Selector (Pills) */}
      {platform && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">
            Category / Service Type
          </label>
          {loadingTypes ? (
            <div className="flex items-center gap-2 py-2 text-slate-400 text-sm">
              <Loader2 className="size-4 animate-spin text-blue-600" />
              Loading categories...
            </div>
          ) : productTypes.length === 0 ? (
            <p className="text-slate-400 text-xs py-1">No specific categories found.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {productTypes.map((type) => {
                const isSelected = productType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handleProductTypeSelect(type)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Product Package Selector */}
      {platform && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">
            Select Package / Service
          </label>
          {loadingProducts ? (
            <div className="flex items-center gap-2 py-3 text-slate-400 text-sm">
              <Loader2 className="size-4 animate-spin text-blue-600" />
              Loading packages...
            </div>
          ) : products.length === 0 ? (
            <p className="text-slate-400 text-xs py-2">No packages available for this selection.</p>
          ) : (
            <div className="relative">
              <select
                value={selectedProduct?._id || selectedProduct?.id || ""}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full h-12 bg-white border border-slate-200 rounded-xl px-3.5 text-sm text-slate-800 font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer appearance-none pr-10"
              >
                {products.map((prod) => (
                  <option key={prod._id || prod.id} value={prod._id || prod.id}>
                    {prod.name} — {formatAmount(prod.amount)} / 1k (Min: {prod.attributes?.min || 10})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Target Link / URL Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">
          Link / Target URL
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <LinkIcon className="size-4" />
          </div>
          <input
            type="url"
            placeholder={`https://${platformName.toLowerCase() || "instagram"}.com/username or post URL`}
            value={inputLink}
            onChange={(e) => setInputLink(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition placeholder:text-slate-400"
            required
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Make sure your profile or post is public during processing.
        </p>
      </div>

      {/* 5. Quantity Input & Real-Time Price Calculation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            Quantity
          </label>
          <span className="text-xs text-slate-500 font-medium">
            Min: <span className="text-slate-800 font-semibold">{minQty.toLocaleString()}</span> • Max: <span className="text-slate-800 font-semibold">{maxQty.toLocaleString()}</span>
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            min={minQty}
            max={maxQty}
            placeholder={`e.g. ${minQty}`}
            value={inputQuantity}
            onChange={(e) => setInputQuantity(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-xl px-3.5 text-sm text-slate-800 font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition placeholder:text-slate-400"
            required
          />
        </div>

        {/* Live Calculation Badge */}
        {numQty > 0 && (
          <div className={`mt-1 p-3 rounded-xl border flex items-center justify-between ${
            isQtyValid 
              ? "bg-blue-50/60 border-blue-100 text-blue-900" 
              : "bg-red-50/60 border-red-100 text-red-800"
          }`}>
            <div className="flex items-center gap-2">
              {isQtyValid ? (
                <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
              ) : (
                <AlertCircle className="size-4 text-red-600 shrink-0" />
              )}
              <span className="text-xs">
                {isQtyValid
                  ? `Rate: ${formatAmount(rate)} per 1,000`
                  : `Quantity must be between ${minQty.toLocaleString()} and ${maxQty.toLocaleString()}`}
              </span>
            </div>
            {isQtyValid && (
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Cost:</span>
                <span className="text-sm font-bold text-blue-600">{formatAmount(calculatedTotal)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-2">
        <CustomButton
          type="submit"
          disabled={!isFormValid}
          className="w-full"
        >
          Proceed to Confirmation
        </CustomButton>
      </div>
    </form>
  );
};

export default RecipientDetails;
