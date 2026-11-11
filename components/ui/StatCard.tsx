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
      <div className="rounded-3xl border border-[#dce7d5] bg-white p-6 shadow-[0_8px_20px_rgba(21,60,42,0.05)]">
        <p className="text-sm text-gray-500">
          {title}
        </p>
  
        <h2 className="mt-2 text-3xl font-bold text-[#113b2b]">
          {value}
        </h2>
  
        <p className="mt-2 text-sm text-gray-400">
          {subtitle}
        </p>
      </div>
    );
  }
