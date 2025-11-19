import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  LogOut,
  Home,
  Users,
  FileText,
  Bell,
  Settings,
  BarChart3,
  Grid,
  Building2,
} from "lucide-react";

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isTeamLead = user?.role === "team_lead";

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
      show: true,
    },
    {
      label: "Sheets",
      href: "/sheets",
      icon: FileText,
      show: true,
    },
    {
      label: "Users",
      href: "/users",
      icon: Users,
      show: isAdmin || isManager,
    },
    {
      label: "Branches",
      href: "/branches",
      icon: Building2,
      show: isAdmin,
    },
    {
      label: "Activity Logs",
      href: "/activity-logs",
      icon: BarChart3,
      show: isAdmin || isManager,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      show: true,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      show: true,
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => item.show);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && <h1 className="font-bold text-lg">Sheet Manager</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.first_name?.[0]?.toUpperCase() || "U"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                title={!sidebarOpen ? item.label : ""}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.first_name}!
          </h2>
          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={20} className="text-gray-600" />
            </Link>
            <Link
              to="/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Settings size={20} className="text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
