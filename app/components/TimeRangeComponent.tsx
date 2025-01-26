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
    <div className="flex flex-row gap-2 items-center">
      {timeRangeOptions.map((option) => (
        <div
          key={option.value}
          onClick={() => setTimeRange(option.value)}
          className={`cursor-pointer rounded-full px-2 py-1 font-medium ${
            timeRange === option.value
              ? "bg-green-600 text-gray-950"
              : "border-green-600 border-2 text-gray-300"
          }`}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default TimeRangeComponent;
