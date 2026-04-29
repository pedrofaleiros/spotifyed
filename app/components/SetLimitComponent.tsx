interface SetLimitComponentProps {
  limit: number;
  setLimit: (newLimit: number) => void;
}

export function SetLimitComponent({ limit, setLimit }: SetLimitComponentProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-gray-950 p-1">
      {[10, 30, 50].map((value) => (
        <button
          type="button"
          key={value}
          onClick={() => setLimit(value)}
          className={`min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition ${
            limit === value
              ? "bg-white text-gray-950"
              : "text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
