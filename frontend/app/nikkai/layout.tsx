import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "./AuthGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex flex-col h-full">
        <div className="h-[10vh]">
          <Navbar />
        </div>
        <div className="h-[90vh] flex flex-row min-h-0">
          <div className="w-[20vw] p-5">
            <Sidebar />
          </div>
          <div className="w-[0.2vw] rounded-sm py-5">
            <div className="w-full h-full bg-background-dark"></div>
          </div>
          <div className="flex-1 h-full min-h-0 w-full">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}