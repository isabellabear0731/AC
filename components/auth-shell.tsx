import BrandLogo from "@/components/brand-logo";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/95 p-7 shadow-[0_20px_55px_rgba(29,70,36,0.14)] backdrop-blur sm:p-10">
        <div className="mb-8 text-center">
          <BrandLogo className="mx-auto mb-5" />

          <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4d9632] before:h-px before:flex-1 before:bg-[#dce7d5] after:h-px after:flex-1 after:bg-[#dce7d5]">
            <span>♥</span>
          </div>

          <h1 className="gps-heading text-3xl font-bold">
            {title}
          </h1>

          <p className="mt-2 text-gray-500">
            {subtitle}
          </p>
        </div>

        {children}

        {footer}

        <div className="mt-10 border-t border-[#dce7d5] pt-5 text-center text-xs text-gray-400">
          © 2026 Gifted People Services
        </div>
      </div>
    </div>
  );
}
