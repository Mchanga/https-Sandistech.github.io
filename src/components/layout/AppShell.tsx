"use client";

import Header from "./Header";
import SideDrawer from "./SideDrawer";
import BottomNav from "./BottomNav";
import SearchOverlay from "./SearchOverlay";
import NotificationsPanel from "./NotificationsPanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <SideDrawer />
      <SearchOverlay />
      <NotificationsPanel />
      <main className="mx-auto max-w-3xl px-3 pb-24 pt-4 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
