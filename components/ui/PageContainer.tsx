import { ReactNode } from "react";
import AppFooter from "@/components/app-footer";

export default function PageContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="gps-page">
      <div className="gps-content">
        {children}
      </div>
      <AppFooter />
    </div>
  );
}
