import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  LayoutDashboard,
  History,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";

const navigation = [
  {
    name: "Chat",
    path: "/",
    icon: MessageSquare,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "History",
    path: "/history",
    icon: History,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-[76px] shrink-0 flex-col border-r-2 border-gray-900 bg-[#fffdf7] px-2 py-4 sm:w-[240px] sm:px-4">

      {/* LOGO */}
      <div className="mb-10 flex items-center justify-center gap-3 px-2 sm:justify-start">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-gray-900 bg-[#e6ddff] shadow-[3px_3px_0px_#222]">
          <Zap size={23} className="text-gray-900" />
        </div>

        <div className="hidden sm:block min-w-0">
          <h1 className="font-['Patrick_Hand'] text-2xl font-bold leading-none text-gray-900">
            SmartCache
          </h1>

          <p className="mt-1 text-xs font-semibold text-gray-500">
            AI Workspace
          </p>
        </div>

      </div>

      {/* NAV LABEL */}
      <div className="mb-3 hidden px-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-gray-400 sm:block">
        Workspace
      </div>

      {/* NAVIGATION */}
      <nav className="flex flex-col gap-2">

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `group flex items-center justify-center gap-3 rounded-xl border-2 px-3 py-3 transition-all sm:justify-start ${
                  isActive
                    ? "border-gray-900 bg-[#e6ddff] shadow-[3px_3px_0px_#222] text-gray-900"
                    : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-white hover:text-gray-900"
                }`
              }
            >
              <Icon size={20} className="shrink-0" />

              <span className="hidden text-sm font-bold sm:block">
                {item.name}
              </span>
            </NavLink>
          );
        })}

      </nav>

      {/* BOTTOM CARD */}
      <div className="mt-auto hidden sm:block">

        <div className="rounded-2xl border-2 border-gray-900 bg-[#d9f3e3] p-4 shadow-[3px_3px_0px_#222]">

          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={16} />
            <span className="text-xs font-extrabold">
              Smart routing
            </span>
          </div>

          <p className="text-xs leading-5 text-gray-600">
            Save tokens with semantic caching and intelligent model selection.
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System ready
          </div>

        </div>

        <p className="mt-4 text-center text-[10px] text-gray-400">
          SmartCache AI · v1.0
        </p>

      </div>

    </aside>
  );
}

export default Sidebar;