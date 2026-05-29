import { clsx } from "clsx";
import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  labelText?: string;
  className?: string;
  inputClassName?: string;
  errorText?: string;
}

export default function TextInput({ 
  id, 
  labelText = "default", 
  className = "", 
  inputClassName = "",
  errorText,
  type = "text", 
  ...props 
}: TextInputProps) {

  return (
    <div className={clsx(className, "flex flex-col select-none mb-2")}>
      <label className="text-text-muted" htmlFor={id}>{labelText}</label>

      <input
        id={id}
        type={type}
        className={clsx(
          "w-full h-10 px-2 outline-none rounded-md border-[0.1vw] border-background-light text-text",
          errorText && "border-red-500 ring-1 ring-red-400",
          inputClassName,
        )}
        {...props}
      />
      {errorText && <span className="mt-1 text-sm text-red-500">{errorText}</span>}
    </div>
  );
}
