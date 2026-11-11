import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: Props) {
  return (
    <Link
      href={href}
      className="
        group
        relative overflow-hidden rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-[#b9d5a9] hover:shadow-[0_14px_28px_rgba(21,60,42,0.11)]
      "
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6e8] transition group-hover:bg-[#e0efd6]">
        <Icon
          size={24}
          className="text-[#4d9632]"
        />
      </div>

      <h3 className="text-lg font-semibold text-[#113b2b]">
        {title}
      </h3>

      <p className="mt-2 pr-6 text-sm leading-6 text-gray-500">
        {description}
      </p>
      <span className="absolute bottom-6 right-6 text-xl font-medium text-[#4d9632] transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}
