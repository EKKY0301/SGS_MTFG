import ScrollTabsContent from "./ScrollTabsContent";
import { TabUnit } from "@/types/tabUnit";
import ScrollTabsHeader from "./ScrollTabsHeader";

export default function ScrollTabs({ items }: { items: TabUnit[] }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <ScrollTabsHeader items={items} />
      <ScrollTabsContent items={items} />
    </div>
  );
}
