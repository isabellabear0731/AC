interface Props {
    title: string;
    value: string;
    subtitle: string;
  }
  
  export default function StatCard({
    title,
    value,
    subtitle,
  }: Props) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <p className="text-sm text-gray-500">
          {title}
        </p>
  
        <h2 className="mt-2 text-3xl font-bold">
          {value}
        </h2>
  
        <p className="mt-2 text-sm text-gray-400">
          {subtitle}
        </p>
      </div>
    );
  }