import { Progress } from "@/components/ui/progress";

type StatBarProps = {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
};

export function StatBar({ label, value, maxValue = 255, color = "#3b82f6" }: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-sm text-gray-600 text-right">{label}</div>
      <div className="flex-1">
        <Progress
          value={percentage}
          className="h-2"
          style={{
            // @ts-ignore - CSS variable override
            "--progress-background": color,
          }}
        />
      </div>
      <div className="w-12 text-sm font-medium text-gray-700 text-right">{value}</div>
    </div>
  );
}
