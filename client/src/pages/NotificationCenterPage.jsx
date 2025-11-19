// /mnt/data/NotificationCenterPage.jsx
import React, { useState, useEffect } from "react";
import { Trash2, Check, CheckCircle2, Bell, Calendar } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../services/api";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Map filter -> backend is_read param
      let isReadParam;
      if (filter === "unread") isReadParam = false;
      else if (filter === "read") isReadParam = true;

      const response = await api.notificationsAPI.getAll(
        1, // page
        50, // limit
        isReadParam
      );

      setNotifications(response.data.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch notifications: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.notificationsAPI.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      setError("Failed to mark notification as read: " + err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      setError("Failed to mark all as read: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.notificationsAPI.delete(id);
      fetchNotifications();
    } catch (err) {
      setError("Failed to delete notification: " + err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <CheckCircle2 size={20} />
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Read
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition ${
                    notif.is_read
                      ? "bg-white border-gray-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Bell
                          size={18}
                          className={
                            notif.is_read ? "text-gray-400" : "text-blue-600"
                          }
                        />
                        <h3
                          className={`font-semibold ${
                            notif.is_read ? "text-gray-600" : "text-gray-900"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          notif.is_read ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                          })}
                        </div>
                        {notif.entity_type && (
                          <div className="text-gray-400">
                            {notif.entity_type} #{notif.entity_id}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                          title="Mark as read"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                        title="Delete notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No notifications</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
