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
        rounded-2xl
        border
        bg-white
        p-6
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-gray-200">
        <Icon
          size={24}
          className="text-gray-700"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-800">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </Link>
  );
}