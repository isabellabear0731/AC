import { ReactNode } from "react";

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
    <div
      className="mb-8 rounded-3xl p-8 shadow-sm"
      style={{
        background: accent,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            {title}
          </h1>

          <p className="mt-2 text-white/90">
            {subtitle}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}