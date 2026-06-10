"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const INITIAL: Quote[] = [
  { symbol: "DSEI", name: "DSE All Share", price: 1903.42, change: 0.84 },
  { symbol: "TSI", name: "Tanzania Share Idx", price: 4221.1, change: -0.32 },
  { symbol: "AAPL", name: "Apple Inc.", price: 213.55, change: 1.27 },
  { symbol: "TBL", name: "Tanzania Breweries", price: 10980, change: 0.45 },
];

export default function MarketTicker() {
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL);

  // Simulate a live market feed
  useEffect(() => {
    const id = setInterval(() => {
      setQuotes((prev) =>
        prev.map((q) => {
          const delta = (Math.random() - 0.5) * (q.price * 0.004);
          const price = Math.max(0.01, q.price + delta);
          const change = q.change + (Math.random() - 0.5) * 0.15;
          return { ...q, price, change: Math.max(-9, Math.min(9, change)) };
        })
      );
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
      {quotes.map((q) => {
        const up = q.change >= 0;
        return (
          <div
            key={q.symbol}
            className="card-soft min-w-[140px] shrink-0 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold">{q.symbol}</span>
              <span
                className={`flex items-center gap-0.5 text-xs font-bold ${
                  up ? "text-green-600" : "text-red-500"
                }`}
              >
                {up ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {up ? "+" : ""}
                {q.change.toFixed(2)}%
              </span>
            </div>
            <p className="mt-1 truncate text-[11px] text-muted">{q.name}</p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              {q.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
