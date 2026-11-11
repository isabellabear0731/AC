import StudentSelector from "./StudentSelector";

export default function PortalHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="gps-surface mb-8 p-5 sm:p-7">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <p className="gps-kicker">Learning portal</p>
          <h1 className="gps-heading mt-2 text-3xl font-bold sm:text-4xl">
            {title}
          </h1>

          {subtitle && (

            <p className="mt-2 text-gray-500">
              {subtitle}
            </p>

          )}

        </div>

        <StudentSelector />

      </div>

    </div>
  );
}
