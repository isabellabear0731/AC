import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({
  href = "/",
  compact = false,
  className = "",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Gifted People Services home"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src="/images/brand/gifted-people-services-logo.jpg"
        alt="Gifted People Services"
        width={compact ? 132 : 210}
        height={compact ? 61 : 98}
        priority={compact}
        className="gps-brand-logo h-auto w-auto"
      />
    </Link>
  );
}
