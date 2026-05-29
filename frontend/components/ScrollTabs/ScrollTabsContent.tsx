import { TabUnit } from "@/types/tabUnit";
import TabSection from "./TabSection";

export default function ScrollTabsContent({ items }: { items: TabUnit[] }) {
  return (
    <div className="flex w-full overflow-x-hidden snap-x snap-mandatory scroll-smooth h-[93%]">
      {items.map((item) => (
        <TabSection key={item.sectionId} id={item.sectionId}>
          {item.component}
        </TabSection>
      ))}
    </div>
  );
}
