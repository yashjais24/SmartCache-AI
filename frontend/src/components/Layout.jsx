import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fffdf7]">

      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <Outlet />
        </div>
      </main>

    </div>
  );
}

export default Layout;