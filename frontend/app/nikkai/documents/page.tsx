import Link from "next/link";

export default function DocumentsPage() {
  return (
    <div className="w-full h-full p-5">
      <div className="w-full h-full bg-background-dark rounded-md p-8">
        <h1 className="text-text font-bold text-2xl">DOCUMENTOS</h1>
        <div className="mt-5 flex flex-col gap-3">
          <Link
            className="w-full h-12 bg-background-light rounded-md flex items-center justify-between px-4 select-none transition-all duration-150 hover:bg-background-light/80 cursor-pointer"
            href="/nikkai/documents/institutional-records"
          >
            <span className="text-text">Registros Institucionales</span>
            <span className="text-sm text-gray-400">→</span>
          </Link>
          <Link
            className="w-full h-12 bg-background-light rounded-md flex items-center justify-between px-4 select-none transition-all duration-150 hover:bg-background-light/80 cursor-pointer"
            href="/nikkai/documents/regulations"
          >
            <span className="text-text">Administración Normativa</span>
            <span className="text-sm text-gray-400">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
