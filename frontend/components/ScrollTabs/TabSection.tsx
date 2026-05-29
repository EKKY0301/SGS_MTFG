export default function TabSection({
  id,
  children
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="w-full h-full flex-shrink-0 snap-start"
    >
      {children}
    </section>
  );
}
