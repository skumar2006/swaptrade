"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

// Define token interface
interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: string;
}

// Zod schema for swap form validation
const swapSchema = z.object({
  fromToken: z.string().min(1, "From token is required"),
  toToken: z.string().min(1, "To token is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)), "Amount must be a number")
    .refine((val) => Number(val) > 0, "Amount must be greater than 0"),
});

type SwapFormData = z.infer<typeof swapSchema>;

export function SwapForm() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [formData, setFormData] = useState<SwapFormData>({
    fromToken: "",
    toToken: "",
    amount: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SwapFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [swapRate, setSwapRate] = useState<number | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // Fetch available tokens
  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoadingTokens(true);
      try {
        const response = await fetch('/api/tokens');
        if (!response.ok) throw new Error('Failed to fetch tokens');
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchTokens();
  }, []);

  // Update swap rate when tokens change
  useEffect(() => {
    const fetchRate = async () => {
      if (formData.fromToken && formData.toToken) {
        setIsLoadingRate(true);
        try {
          const response = await fetch(`/api/rates?from=${formData.fromToken}&to=${formData.toToken}`);
          if (!response.ok) throw new Error('Failed to fetch rate');
          const data = await response.json();
          setSwapRate(data.rate);
        } catch (error) {
          console.error('Error fetching rate:', error);
          setSwapRate(null);
        } finally {
          setIsLoadingRate(false);
        }
      } else {
        setSwapRate(null);
      }
    };

    fetchRate();
  }, [formData.fromToken, formData.toToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data with Zod
      const validatedData = swapSchema.parse(formData);
      
      // Clear any previous errors
      setErrors({});

      // In a real app, this would call your swap API endpoint
      console.log("Performing swap with data:", validatedData);
      
      // Simulate API call success after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Swap successful!");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to a more usable format
        const formattedErrors: Partial<Record<keyof SwapFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof SwapFormData] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        console.error("Swap failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border p-6 shadow-sm">
      {isLoadingTokens ? (
        <div className="flex justify-center p-6">
          <p>Loading tokens...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block font-medium">From</label>
            <select
              name="fromToken"
              value={formData.fromToken}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              disabled={isLoading}
            >
              <option value="">Select token</option>
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.symbol} - {token.name} (Balance: {token.balance})
                </option>
              ))}
            </select>
            {errors.fromToken && (
              <p className="mt-1 text-sm text-red-500">{errors.fromToken}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block font-medium">To</label>
            <select
              name="toToken"
              value={formData.toToken}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              disabled={isLoading}
            >
              <option value="">Select token</option>
              {tokens.map((token) => (
                <option key={token.id} value={token.id} disabled={token.id === formData.fromToken}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            {errors.toToken && (
              <p className="mt-1 text-sm text-red-500">{errors.toToken}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-2 block font-medium">Amount</label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              placeholder="0.0"
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {isLoadingRate ? (
            <div className="mb-4 rounded-md bg-gray-100 p-3">
              <p className="text-sm">Loading exchange rate...</p>
            </div>
          ) : (
            swapRate && formData.amount && !isNaN(Number(formData.amount)) && (
              <div className="mb-4 rounded-md bg-gray-100 p-3">
                <p className="text-sm">
                  {`You will receive approximately ${(Number(formData.amount) * swapRate).toFixed(6)} 
                  ${tokens.find(t => t.id === formData.toToken)?.symbol || ''}`}
                </p>
                <p className="text-xs text-gray-500">
                  {`Rate: 1 ${tokens.find(t => t.id === formData.fromToken)?.symbol || ''} = 
                  ${swapRate} ${tokens.find(t => t.id === formData.toToken)?.symbol || ''}`}
                </p>
              </div>
            )
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 py-2 font-medium text-white hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading || isLoadingRate}
          >
            {isLoading ? "Processing..." : "Swap Tokens"}
          </button>
        </form>
      )}
    </div>
  );
} 