"use client";

import { Suspense } from "react";
import NewsFeed from "./NewsFeed";

export default function NewsPage() {
  return (
    <Suspense fallback={null}>
      <NewsFeed />
    </Suspense>
  );
}
