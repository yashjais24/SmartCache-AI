import { NavLink } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  LayoutDashboard,
  History,
  Settings,
  Cpu,
  Heart
} from "lucide-react";

function Sidebar() {
  const navigation = [
    { name: "Chat", path: "/", icon: MessageSquare },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "History", path: "/history", icon: History },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles size={25} />
        </div>

        <div className="brand-text">
          <h2>SmartCache</h2>
          <span>your little AI helper</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">
          YOUR WORKSPACE <span>✿</span>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-doodle">
        <div className="doodle-sparkle">✧</div>
        <p>Take a breath.</p>
        <p>Let AI do the repetitive work.</p>
        <div className="doodle-heart">♡</div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-engine">
          <div className="engine-icon">
            <Cpu size={18} />
          </div>

          <div className="engine-info">
            <div className="engine-title">Local AI Engine</div>
            <div className="engine-subtitle">Powered by Ollama</div>
          </div>

          <span className="status-dot" />
        </div>

        <div className="sidebar-footer">
          Made with <Heart size={12} /> SmartCache AI
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;