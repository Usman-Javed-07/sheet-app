// /mnt/data/SheetsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { sheetsAPI } from "../services/api";
import { FileText, Plus, Search } from "lucide-react";
import Layout from "../components/Layout";

export const SheetsPage = () => {
  const { user } = useAuth();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const roleName = user?.roleName || user?.role?.name || user?.role || "";

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setLoading(true);
        const res = await sheetsAPI.getAll(page, 20, search, "false");
        setSheets(res.data.data);
        setTotalPages(res.data.pagination.pages);
      } catch (error) {
        console.error("Error fetching sheets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, [page, search]);

  const canCreate = ["admin", "manager", "team_lead"].includes(roleName);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Sheets</h1>
          {canCreate && (
            <Link
              to="/sheets/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              New Sheet
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sheets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sheets Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : sheets.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sheets found</p>
            {canCreate && (
              <Link
                to="/sheets/new"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create First Sheet
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheets.map((sheet) => (
              <SheetCard key={sheet.id} sheet={sheet} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

const SheetCard = ({ sheet }) => {
  return (
    <Link
      to={`/sheets/${sheet.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {sheet.name}
            </h3>
            <p className="text-xs text-gray-500">
              by {sheet.creator?.first_name || "Unknown"}
            </p>
          </div>
        </div>
      </div>
      {sheet.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {sheet.description}
        </p>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {new Date(sheet.created_at).toLocaleDateString()}
        </span>
        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {sheet.branch?.name}
        </span>
      </div>
    </Link>
  );
};

export default SheetsPage;
