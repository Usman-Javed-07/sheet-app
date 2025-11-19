import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { sheetsAPI, cellsAPI } from "../services/api";
import { ChevronLeft } from "lucide-react";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export const SheetEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [cells, setCells] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    const fetchSheet = async () => {
      try {
        setLoading(true);
        const res = await sheetsAPI.getById(id);
        setSheet(res.data.data.sheet);

        // Initialize cells
        const cellsMap = {};
        res.data.data.cells.forEach((cell) => {
          cellsMap[`${cell.row}-${cell.col}`] = cell.value;
        });
        setCells(cellsMap);
      } catch (error) {
        console.error("Error fetching sheet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSheet();
  }, [id]);

  const handleCellChange = async (row, col, value) => {
    const key = `${row}-${col}`;
    setCells((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Auto-save to backend
    try {
      await cellsAPI.save(id, { row, col, value });
    } catch (error) {
      console.error("Error saving cell:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!sheet) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Sheet not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/sheets")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{sheet.name}</h1>
            {sheet.description && (
              <p className="text-gray-600">{sheet.description}</p>
            )}
          </div>
        </div>

        {/* Sheet Info */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Branch
            </p>
            <p className="text-sm font-medium text-gray-900">
              {sheet.branch?.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Created By
            </p>
            <p className="text-sm font-medium text-gray-900">
              {sheet.creator?.first_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Created At
            </p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(sheet.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-12 h-10 border-r border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600"></th>
                {Array.from({ length: sheet.columns || 26 }).map((_, i) => (
                  <th
                    key={i}
                    className="w-20 h-10 border-r border-gray-200 text-center text-xs font-semibold text-gray-600 bg-gray-50"
                  >
                    {String.fromCharCode(65 + i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: sheet.rows || 100 }).map((_, row) => (
                <tr key={row} className="border-b border-gray-200">
                  <td className="w-12 h-10 border-r border-gray-200 bg-gray-50 text-center text-xs font-semibold text-gray-600">
                    {row + 1}
                  </td>
                  {Array.from({ length: sheet.columns || 26 }).map((_, col) => {
                    const key = `${row}-${col}`;
                    const value = cells[key] || "";
                    return (
                      <td
                        key={key}
                        className="w-20 h-10 border-r border-gray-200 p-0"
                        onClick={() => setSelectedCell(key)}
                      >
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleCellChange(row, col, e.target.value)
                          }
                          className={`w-full h-full px-2 border-0 outline-none text-sm ${
                            selectedCell === key
                              ? "bg-blue-50 ring-2 ring-blue-500"
                              : "bg-white"
                          } hover:bg-gray-50 focus:bg-blue-50`}
                          onFocus={() => setSelectedCell(key)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default SheetEditorPage;
