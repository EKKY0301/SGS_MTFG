"use client";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { SidebarItem } from "@/types/sidebar";
import Link from "next/link";
import { useSessionContext } from "@/services/session/context/context";

const nikkaiItems: SidebarItem[] = [
  {
    text: "INICIO",
    link: "/nikkai/home",
    children: [],
  },
  {
    text: "SOCIOS",
    link: "/nikkai/member",
    children: [
      {
        text: "LISTA",
        link: "/nikkai/member/list"
      },
      {
        text: "AGREGAR",
        link: "/nikkai/member/add"
      },
    ]
  },
  {
    text: "EVENTOS",
    link: "/nikkai/event",
    children: [
      {
        text: "LISTA",
        link: "/nikkai/event/list"
      },
      {
        text: "AGREGAR",
        link: "/nikkai/event/add"
      },
      {
        text: "CALENDARIO",
        link: "/nikkai/event/calendar"
      },
    ]
  },
  {
    text: "DOCUMENTOS",
    link: "/nikkai/documents",
    children: [
      {
        text: "REGISTROS",
        link: "/nikkai/documents/institutional-records"
      },
      {
        text: "NORMATIVAS",
        link: "/nikkai/documents/regulations"
      },
    ]
  },
  {
    text: "CONFIGURACIÓN*",
    link: "/nikkai/config",
    children: [
      {
        text: "AUDITORÍA",
        link: "/nikkai/config/audit"
      },
    ]
  }
]

function SidebarList({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  const { isAdmin } = useSessionContext();

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.link);

        if(item.text.endsWith("*") && !isAdmin) {
          return null; // No renderizar el item si es de configuración y el usuario no es admin
        }

        return (
          <div key={item.link} className={clsx(
            "transition-all duration-200 select-none",
            active && item.children ? "border-sidebar-selected border-l-[1vw]" : "",
            !active && item.children ? "hover:border-sidebar-selected hover:border-l-[1vw]" : "",
          )}>
            <Link
              href={item.link}
              className={clsx(
                "block px-0 py-2 text-sidebar-selected transition-all duration-200",
                !item.children && active &&
                "bg-sidebar-selected text-white font-bold pl-2",
                item.children && active && "pl-3 bg-transparent text-lg font-bold",
                !item.children && !active &&
                "hover:bg-sidebar-selected hover:text-white hover:font-bold hover:pl-2",
                item.children && !active && "hover:pl-3 hover:bg-transparent hover:text-lg hover:font-bold",
              )}
            >
              {item.text.includes("*") ? item.text.replace("*", "") : item.text}
            </Link>

            {/* children */}
            {item.children && active && (
              <div className="ml-6 mt-1 space-y-1">
                <SidebarList items={item.children} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


export default function Sidebar({ }) {
  return <div className="w-full h-full flex flex-col gap-[0.5vw]">
    <SidebarList items={nikkaiItems} />
  </div>
}
