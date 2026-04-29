import React from "react";
import { ItemsTimeRange } from "@/services/itemsService";

interface TimeRangeComponentProps {
  timeRange: ItemsTimeRange;
  setTimeRange: (newTimeRange: ItemsTimeRange) => void;
}

const TimeRangeComponent: React.FC<TimeRangeComponentProps> = ({
  timeRange,
  setTimeRange,
}) => {
  const timeRangeOptions = [
    { label: "1 mês", value: ItemsTimeRange.short_term },
    { label: "6 meses", value: ItemsTimeRange.medium_term },
    { label: "1 ano", value: ItemsTimeRange.long_term },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-gray-950 p-1">
      {timeRangeOptions.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => setTimeRange(option.value)}
          className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition ${
            timeRange === option.value
              ? "bg-green-400 text-gray-950"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeComponent;
