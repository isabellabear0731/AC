import StudentSelector from "./StudentSelector";

export default function PortalHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">

      <div className="flex items-start justify-between">

        <div>

          <h1 className="text-4xl font-bold">
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