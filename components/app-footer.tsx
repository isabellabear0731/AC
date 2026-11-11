import BrandLogo from "@/components/brand-logo";

export default function AppFooter() {
  return (
    <footer className="gps-footer">
      <BrandLogo compact className="opacity-85" />
      <span>© {new Date().getFullYear()} Gifted People Services</span>
    </footer>
  );
}
