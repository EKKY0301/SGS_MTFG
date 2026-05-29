'use client'
import 'simplebar-react/dist/simplebar.min.css';
import clsx from 'clsx';

export default function ScrollArea({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={clsx(className, "flex flex-col gap-2 overflow-scroll no-scrollbar w-full h-full pb-5")}>
      {children}
    </div>
  );
}
