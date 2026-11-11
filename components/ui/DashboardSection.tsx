import { ReactNode } from "react";

export default function DashboardSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-[#113b2b] before:h-5 before:w-1 before:rounded-full before:bg-[#4d9632]">
        {title}
      </h2>

      {children}
    </section>
  );
}
