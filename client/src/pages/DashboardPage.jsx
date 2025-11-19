// /mnt/data/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { sheetsAPI, notificationsAPI } from "../services/api";
import { FileText, Users, BarChart3, Bell } from "lucide-react";
import Layout from "../components/Layout";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sheets: 0,
    users: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);

  const roleName = user?.roleName || user?.role?.name || user?.role || "";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const sheetsRes = await sheetsAPI.getAll(1, 1);
        const notifRes = await notificationsAPI.getAll(1, 1);

        setStats({
          sheets: sheetsRes.data.pagination?.total || 0,
          notifications: notifRes.data.pagination?.total || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.first_name}! You are logged in as{" "}
            <span className="font-semibold capitalize">{roleName}</span>.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            title="Sheets"
            value={stats.sheets}
            color="blue"
          />
          <StatCard
            icon={Bell}
            title="Notifications"
            value={stats.notifications}
            color="yellow"
          />
          {(roleName === "admin" || roleName === "manager") && (
            <>
              <StatCard
                icon={Users}
                title="Team Members"
                value="N/A"
                color="green"
              />
              <StatCard
                icon={BarChart3}
                title="Activity"
                value="View"
                color="purple"
              />
            </>
          )}
        </div>

        {/* Role-based Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <QuickStartCard role={roleName} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivityCard />
            <RoleInfoCard role={roleName} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[color]}`}
      >
        <Icon size={24} />
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
};

const QuickStartCard = ({ role }) => {
  const getQuickStartGuide = () => {
    switch (role) {
      case "admin":
        return [
          "Create new branches",
          "Manage all users",
          "View system activity logs",
          "Create and share sheets across organization",
        ];
      case "manager":
        return [
          "Create sheets for your branch",
          "Manage branch users",
          "Share sheets with team members",
          "View branch activity logs",
        ];
      case "team_lead":
        return [
          "Create sheets for your team",
          "Manage team members",
          "Share sheets with team",
          "View team activity",
        ];
      case "user":
        return [
          "View shared sheets",
          "Edit assigned sheets",
          "Check notifications",
          "Update your profile",
        ];
      case "agent":
        return [
          "View assigned sheets (read-only)",
          "Check notifications",
          "Update your profile",
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Quick Start Guide
      </h2>
      <ul className="space-y-3">
        {getQuickStartGuide().map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold mt-0.5">
              {index + 1}
            </div>
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const RecentActivityCard = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        <ActivityItem
          action="Sheet created"
          target="Q4 Sales Report"
          time="2 hours ago"
        />
        <ActivityItem
          action="User added"
          target="John Doe"
          time="5 hours ago"
        />
        <ActivityItem
          action="Sheet shared"
          target="Q3 Analysis"
          time="1 day ago"
        />
      </div>
    </div>
  );
};

const ActivityItem = ({ action, target, time }) => (
  <div className="flex items-start justify-between pb-3 border-b border-gray-200 last:border-0">
    <div>
      <p className="text-sm text-gray-900">
        <strong>{action}</strong>
      </p>
      <p className="text-xs text-gray-500">{target}</p>
    </div>
    <span className="text-xs text-gray-400">{time}</span>
  </div>
);

const RoleInfoCard = ({ role }) => {
  const getRoleInfo = () => {
    switch (role) {
      case "admin":
        return {
          title: "Admin",
          description:
            "Full system access. You can manage all resources and view all data.",
          permissions: [
            "Create branches",
            "Manage users",
            "View all sheets",
            "View audit logs",
          ],
        };
      case "manager":
        return {
          title: "Manager",
          description:
            "Branch-level management. You can manage your branch resources.",
          permissions: [
            "Create sheets",
            "Manage branch users",
            "View branch data",
            "Share sheets",
          ],
        };
      case "team_lead":
        return {
          title: "Team Lead",
          description:
            "Team-level management. You oversee your team and resources.",
          permissions: [
            "Create sheets",
            "Manage team",
            "View team data",
            "Share sheets",
          ],
        };
      case "user":
        return {
          title: "User",
          description: "Edit permissions on shared sheets.",
          permissions: [
            "View shared sheets",
            "Edit sheets",
            "View notifications",
          ],
        };
      case "agent":
        return {
          title: "Agent",
          description: "View-only access to shared sheets.",
          permissions: ["View shared sheets", "View notifications"],
        };
      default:
        return { title: "User", description: "", permissions: [] };
    }
  };

  const info = getRoleInfo();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-100">
      <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{info.description}</p>
      <div className="space-y-2">
        {info.permissions.map((perm, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-xs text-gray-700">{perm}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
