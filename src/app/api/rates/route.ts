import { NextResponse } from "next/server";

// Mock exchange rates data
const rates = {
  "1-2": 1800, // ETH to USDC
  "1-3": 1805, // ETH to DAI
  "2-1": 0.00055, // USDC to ETH
  "2-3": 1.01, // USDC to DAI
  "3-1": 0.00053, // DAI to ETH
  "3-2": 0.99, // DAI to USDC
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromToken = searchParams.get("from");
  const toToken = searchParams.get("to");

  // Validate inputs
  if (!fromToken || !toToken) {
    return NextResponse.json(
      { error: "Both 'from' and 'to' parameters are required" },
      { status: 400 }
    );
  }

  // Get the rate
  const rateKey = `${fromToken}-${toToken}`;
  const rate = rates[rateKey as keyof typeof rates];

  if (rate === undefined) {
    return NextResponse.json(
      { error: "Rate not found for the requested pair" },
      { status: 404 }
    );
  }

  // Simulate a slight delay like a real API would have
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({ rate });
} 