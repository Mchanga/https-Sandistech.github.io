"use client";

import Header from "./Header";
import SideDrawer from "./SideDrawer";
import BottomNav from "./BottomNav";
import SearchOverlay from "./SearchOverlay";
import NotificationsPanel from "./NotificationsPanel";
import Footer from "./Footer";
import InstallPrompt from "./InstallPrompt";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SideDrawer />
      <SearchOverlay />
      <NotificationsPanel />
      <main className="mx-auto w-full max-w-3xl flex-1 px-3 pt-4">{children}</main>
      <Footer />
      {/* spacer so content/footer clear the fixed mobile bottom nav */}
      <div className="h-20 md:hidden" />
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
