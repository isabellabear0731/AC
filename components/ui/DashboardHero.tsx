import { ReactNode } from "react";
import BrandLogo from "@/components/brand-logo";

interface DashboardHeroProps {
  title: string;
  subtitle: string;
  accent: string;
  children?: ReactNode;
}

export default function DashboardHero({
  title,
  subtitle,
  accent,
  children,
}: DashboardHeroProps) {
  return (
    <div className="gps-surface relative mb-8 overflow-hidden p-6 sm:p-8">
      <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full opacity-30" style={{ background: accent }} />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-5">
          <BrandLogo compact className="hidden sm:inline-flex" />
          <div>
          <p className="gps-kicker">Gifted People Services</p>
          <h1 className="gps-heading mt-2 text-3xl font-bold sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            {subtitle}
          </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">{children}</div>
      </div>
    </div>
  );
}
