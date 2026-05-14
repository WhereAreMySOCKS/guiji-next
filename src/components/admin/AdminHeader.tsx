"use client";

import { logout } from "@/lib/admin/auth";

export default function AdminHeader() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      <span className="md:hidden text-lg font-bold text-gray-800">
        龟迹管理端
      </span>
      <div className="flex-1" />
      <button
        onClick={logout}
        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
      >
        退出登录
      </button>
    </header>
  );
}
