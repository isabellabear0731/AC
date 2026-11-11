import AppFooter from "@/components/app-footer";
import BrandLogo from "@/components/brand-logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#dce7d5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-8">
          <BrandLogo href="/dashboard" compact />
          <div className="border-l border-[#dce7d5] pl-4">
            <p className="gps-kicker">Gifted People Services</p>
            <p className="text-sm font-semibold text-[#113b2b]">Center Workspace</p>
          </div>
        </div>
      </header>
      {children}
      <AppFooter />
    </div>
  );
}
