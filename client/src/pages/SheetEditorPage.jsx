import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sheetsAPI, cellsAPI, branchesAPI } from "../services/api";
import { ChevronLeft } from "lucide-react";
import Layout from "../components/Layout";

export const SheetEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "new";

  const [sheet, setSheet] = useState(null);
  const [cells, setCells] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

  // For new sheet creation
  const [branches, setBranches] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    branch_id: "",
    rows: 100,
    columns: 26,
  });

  // Fetch for existing sheet OR load data for new sheet
  useEffect(() => {
    const init = async () => {
      if (isNew) {
        // New sheet mode: no fetch /sheets/new
        try {
          setLoading(true);
          const res = await branchesAPI.getAll();
          setBranches(res.data.data || []);
        } catch (err) {
          console.error("Error fetching branches:", err);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Existing sheet mode
      try {
        setLoading(true);
        const res = await sheetsAPI.getById(id);
        const sheetData = res.data.data.sheet;
        const sheetCells = res.data.data.cells || [];

        setSheet(sheetData);

        const cellsMap = {};
        sheetCells.forEach((cell) => {
          cellsMap[`${cell.row}-${cell.col}`] = cell.value;
        });
        setCells(cellsMap);
      } catch (error) {
        console.error("Error fetching sheet:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id, isNew]);

  // Handle create new sheet
  const handleCreateSheet = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!createForm.name.trim()) {
      setCreateError("Sheet name is required.");
      return;
    }
    if (!createForm.branch_id) {
      setCreateError("Please select a branch.");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
        branch_id: createForm.branch_id,
        rows: Number(createForm.rows) || 100,
        columns: Number(createForm.columns) || 26,
      };

      const res = await sheetsAPI.create(payload);
      const newSheet = res.data.data || res.data.sheet || res.data;

      // Assuming newSheet.id exists
      navigate(`/sheets/${newSheet.id}`);
    } catch (err) {
      console.error("Error creating sheet:", err);
      setCreateError(
        err.response?.data?.message || "Failed to create sheet. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCellChange = async (row, col, value) => {
    const key = `${row}-${col}`;
    setCells((prev) => ({
      ...prev,
      [key]: value,
    }));

    try {
      await cellsAPI.save(id, { row, col, value });
    } catch (error) {
      console.error("Error saving cell:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // NEW SHEET MODE – show create form instead of "Sheet not found"
  if (isNew) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/sheets")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Sheet</h1>
              <p className="text-gray-600">
                Define basic details and branch, then start editing your sheet.
              </p>
            </div>
          </div>

          {/* Create Form */}
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            {createError && (
              <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSheet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sheet Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Monthly Report"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Short description of this sheet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <select
                  value={createForm.branch_id}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, branch_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rows
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.rows}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, rows: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.columns}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, columns: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create & Open Sheet"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/sheets")}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  // EXISTING SHEET NOT FOUND
  if (!sheet) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Sheet not found</p>
        </div>
      </Layout>
    );
  }

  // EXISTING SHEET EDITOR
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
