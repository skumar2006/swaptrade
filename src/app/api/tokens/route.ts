import { NextResponse } from "next/server";

// Mock token data
const tokens = [
  { id: "1", symbol: "ETH", name: "Ethereum", balance: "10.5" },
  { id: "2", symbol: "USDC", name: "USD Coin", balance: "1000" },
  { id: "3", symbol: "DAI", name: "Dai Stablecoin", balance: "500" },
];

export async function GET() {
  // Simulate a slight delay like a real API would have
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(tokens);
} 