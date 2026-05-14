"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/taxonomy", label: "物种管理", icon: "pets" },
  { href: "/admin/config", label: "策略配置", icon: "tune" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 min-h-screen hidden md:block">
      <div className="p-4 border-b border-gray-100">
        <Link href="/admin/taxonomy" className="text-lg font-bold text-gray-800">
          龟迹管理端
        </Link>
      </div>
      <nav className="p-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                active
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
