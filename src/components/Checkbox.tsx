export const Checkbox = ({
  checked,
  indeterminate = false,
  onChange,
  ...props
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  "aria-label"?: string;
}) => (
  <input
    {...props}
    type="checkbox"
    checked={checked}
    ref={(el) => {
      if (el) el.indeterminate = indeterminate;
    }}
    onChange={(e) => onChange(e.target.checked)}
    className="size-4.5 shrink-0 cursor-pointer accent-tuned"
  />
);
