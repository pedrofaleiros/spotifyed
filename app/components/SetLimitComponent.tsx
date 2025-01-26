interface SetLimitComponentProps {
  limit: number;
  setLimit: (newLimit: number) => void;
}

export function SetLimitComponent({ limit, setLimit }: SetLimitComponentProps) {
  return (
    <div className="flex flex-row gap-2 items-center">
      {[5, 10, 30, 50].map((value) => (
        <div
          key={value}
          onClick={() => setLimit(value)}
          className={`cursor-pointer rounded-full px-4 py-1 ${
            limit === value
              ? "bg-blue-600 text-gray-950 font-semibold"
              : "border-blue-600 border-[1px] text-gray-300"
          }`}
        >
          {value}
        </div>
      ))}
    </div>
  );
}
