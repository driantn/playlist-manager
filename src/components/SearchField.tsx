export const SearchField = ({
  value,
  onChange,
  placeholder,
  "aria-label": label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  "aria-label": string;
}) => (
  <div className="relative flex min-w-0 grow items-center">
    <input
      type="search"
      aria-label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && value) {
          e.preventDefault();
          onChange("");
        }
      }}
      className="w-full rounded-md border border-line bg-surface p-2 pr-8 [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onChange("")}
        className="absolute right-1 grid size-7 place-items-center rounded text-muted hover:bg-canvas"
      >
        ×
      </button>
    )}
  </div>
);
