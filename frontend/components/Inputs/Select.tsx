import { clsx } from "clsx";
import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  labelText?: string;
  className?: string;
  selectClassName?: string;
  errorText?: string;
  children?: React.ReactNode;
}

export default function Select({
  id,
  labelText = "default",
  className = "",
  selectClassName = "",
  errorText,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={clsx(className, "flex flex-col select-none mb-2")}>
      <label className="text-text-muted" htmlFor={id}>
        {labelText}
      </label>

      <select
        id={id}
        className={clsx(
          "outline-none rounded-md border-[0.1vw] border-background-light h-10 text-text",
          errorText && "border-red-500 ring-1 ring-red-400",
          selectClassName,
        )}
        {...props} // AQUI react-hook-form mete ref, onChange, name, onBlur, etc.
      >
        <option value="">Seleccione una / 一つお選びください</option>
        {children}
      </select>
      {errorText && <span className="mt-1 text-sm text-red-500">{errorText}</span>}
    </div>
  );
}
