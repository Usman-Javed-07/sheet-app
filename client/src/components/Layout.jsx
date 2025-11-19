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
  Building2,
} from "lucide-react";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role?.name === "admin";
  const isManager = user?.role?.name === "manager";

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
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">SheetApp</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-800">
            <p className="text-sm font-semibold text-gray-200">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400">{user?.role?.name}</p>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                    title={item.label}
                  >
                    <Icon size={20} />
                    {sidebarOpen && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
            title="Logout"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {user?.first_name}!
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative">
              <Bell size={24} className="text-gray-600 hover:text-gray-900" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Link>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
              {user?.first_name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
      </div>
    </div>
  );
}
