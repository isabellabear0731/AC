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
      <h2 className="mb-5 text-xl font-semibold text-gray-700">
        {title}
      </h2>

      {children}
    </section>
  );
}