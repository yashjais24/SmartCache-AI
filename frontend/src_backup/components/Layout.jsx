import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#fffdf7]">
      <Sidebar />

      <main className="flex-1 min-w-0 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;