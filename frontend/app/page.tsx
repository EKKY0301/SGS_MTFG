import { redirect } from "next/navigation";

export default function Home() {
  redirect('/nikkai/home')
  return (
    <main className="flex h-full items-center justify-center bg-background-dark">
    </main>
  );
}