// components/StatBar.tsx
type Props = { label: string; value: number; max?: number };

export default function StatBar({ label, value, max = 180 }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="capitalize">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}