import Link from "next/link";
import { TabUnit } from "@/types/tabUnit";

export default function ScrollTabsHeader({ items }: { items: TabUnit[] }) {
  return (
    <div className="w-full h-[7%] flex border-b border-background-dark/30 overflow-x-auto">
      {items.map((item) => (
        <Link
          key={item.sectionId}
          href={`#${item.sectionId}`}
          className="px-4 py-2 text-sm font-semibold text-text hover:text-text-muted transition-colors whitespace-nowrap"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
