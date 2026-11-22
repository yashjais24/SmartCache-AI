
import { useEffect, useMemo, useState } from "react";
import {
  getHistory,
  deleteHistoryRecord,
  clearHistory,
} from "../services/api";

import {
  History as HistoryIcon,
  Search,
  RefreshCw,
  Database,
  Zap,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  Trash2,
} from "lucide-react";

const cardStyle =
  "rounded-2xl border-2 border-gray-900 bg-white shadow-[3px_3px_0px_#222]";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState(null);

  // Fetch history
  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getHistory(100);
      const records = Array.isArray(data) ? data : data?.value ?? [];

      setHistory(records);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load history. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Search and filtering
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        !search ||
        item.query?.toLowerCase().includes(searchText) ||
        item.response?.toLowerCase().includes(searchText) ||
        item.model_used?.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "all" ||
        (filter === "hits" && item.cache_hit) ||
        (filter === "misses" && !item.cache_hit);

      return matchesSearch && matchesFilter;
    });
  }, [history, search, filter]);

  // Statistics
  const hits = history.filter((item) => item.cache_hit).length;
  const misses = history.length - hits;

  const hitRate =
    history.length > 0
      ? ((hits / history.length) * 100).toFixed(1)
      : "0.0";

  // Expand/collapse response
  const toggleExpanded = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Format latency
  const formatLatency = (ms) => {
    if (ms == null) return "—";

    return ms < 1000
      ? `${Number(ms).toFixed(0)} ms`
      : `${(Number(ms) / 1000).toFixed(2)} s`;
  };

  // Format cost
  const formatCost = (cost) => {
    if (cost == null) return "—";

    return `$${Number(cost).toFixed(6)}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteRecord = (id) => {
  setConfirmModal({
    type: "delete",
    id,
  });
};

const handleClearHistory = () => {
  setConfirmModal({
    type: "clear",
  });
};

const confirmAction = async () => {
  if (!confirmModal) return;

  try {
    if (confirmModal.type === "delete") {
      const id = confirmModal.id;

      setDeletingId(id);

      await deleteHistoryRecord(id);

      setHistory((prev) => prev.filter((item) => item.id !== id));

      setExpanded((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }

    if (confirmModal.type === "clear") {
      setClearingHistory(true);

      await clearHistory();

      setHistory([]);
      setExpanded({});
      setSearch("");
      setFilter("all");
    }

    setConfirmModal(null);
  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.detail ||
        "Operation failed. Please try again."
    );
  } finally {
    setDeletingId(null);
    setClearingHistory(false);
  }
};
  // Copy text
  const copyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(id);

      setTimeout(() => setCopied(null), 1500);
    } catch {
      console.error("Unable to copy");
    }
  };

  return (
    <div className="min-w-0 space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <HistoryIcon size={22} />

            <h1 className="font-['Patrick_Hand'] text-4xl font-bold">
              Query History
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Explore and revisit your previous AI conversations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 self-start sm:self-auto">
          {/* Refresh */}
          <button
            onClick={loadHistory}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-900 bg-[#fff0bd] px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

          {/* Clear History */}
          <button
            onClick={handleClearHistory}
            disabled={history.length === 0 || clearingHistory}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-600 bg-red-100 px-4 py-3 text-sm font-bold text-red-700 shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none disabled:opacity-40"
          >
            <Trash2 size={17} />

            {clearingHistory ? "Clearing..." : "Clear History"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Queries */}
        <div className={`${cardStyle} bg-[#e6ddff] p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600">
                Total Queries
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {history.length}
              </h2>
            </div>

            <MessageSquare size={27} />
          </div>
        </div>

        {/* Cache Hits */}
        <div className={`${cardStyle} bg-[#d9f3e3] p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600">
                Cache Hits
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {hits}
              </h2>
            </div>

            <Database size={27} />
          </div>
        </div>

        {/* Cache Misses */}
        <div className={`${cardStyle} bg-[#fff0bd] p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600">
                Cache Misses
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {misses}
              </h2>
            </div>

            <Zap size={27} />
          </div>
        </div>

        {/* Hit Rate */}
        <div className={`${cardStyle} bg-[#ffdede] p-5`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600">
                Cache Hit Rate
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {hitRate}%
              </h2>
            </div>

            <Sparkles size={27} />
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className={`${cardStyle} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search queries, responses or models..."
              className="w-full rounded-xl border-2 border-gray-900 bg-[#fffdf7] py-3 pl-11 pr-4 text-sm outline-none transition focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All queries" },
              { value: "hits", label: "Cache hits" },
              { value: "misses", label: "Cache misses" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
                  filter === option.value
                    ? "border-gray-900 bg-[#e6ddff] shadow-[2px_2px_0px_#222]"
                    : "border-gray-300 bg-white hover:border-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

            <p className="font-['Patrick_Hand'] text-xl font-bold">
              Loading history...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className={`${cardStyle} bg-[#ffe1e1] p-8 text-center`}>
          <h2 className="font-['Patrick_Hand'] text-2xl font-bold">
            Something went wrong
          </h2>

          <p className="mt-3 text-sm">{error}</p>

          <button
            onClick={loadHistory}
            className="mt-5 rounded-xl border-2 border-gray-900 bg-white px-5 py-3 font-bold shadow-[3px_3px_0px_#222]"
          >
            Try again
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className={`${cardStyle} p-12 text-center`}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gray-900 bg-[#e6ddff]">
            <HistoryIcon size={30} />
          </div>

          <h2 className="font-['Patrick_Hand'] text-2xl font-bold">
            {history.length === 0
              ? "No queries yet"
              : "No matching queries"}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {history.length === 0
              ? "Start chatting with SmartCache to build your history."
              : "Try changing your search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results count */}
          <div className="flex items-center justify-between text-sm font-semibold text-gray-500">
            <span>
              Showing {filteredHistory.length} of {history.length} queries
            </span>
          </div>

          {/* Query cards */}
          {filteredHistory.map((item) => {
            const id = item.id;
            const isExpanded = expanded[id];

            return (
              <div
                key={id}
                className={`${cardStyle} min-w-0 overflow-hidden transition`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Status and Date */}
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {item.cache_hit ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[#d9f3e3] px-2.5 py-1 text-xs font-bold text-emerald-800">
                            <Database size={13} />
                            Cache Hit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[#fff0bd] px-2.5 py-1 text-xs font-bold text-amber-800">
                            <Zap size={13} />
                            Cache Miss
                          </span>
                        )}

                        <span className="text-xs text-gray-400">
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      {/* Query */}
                      <h3 className="break-words text-base font-extrabold leading-6">
                        {item.query || "Untitled query"}
                      </h3>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {/* Copy Query */}
                      <button
                        onClick={() =>
                          copyText(item.query || "", `query-${id}`)
                        }
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold transition hover:bg-gray-50"
                      >
                        {copied === `query-${id}` ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy query
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteRecord(id)}
                        disabled={deletingId === id}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={14} />

                        {deletingId === id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.model_used && (
                      <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600">
                        🤖 {item.model_used.split("/").pop()}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600">
                      <Clock size={12} />
                      {formatLatency(item.latency_ms)}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600">
                      <DollarSign size={12} />
                      {formatCost(item.estimated_cost)}
                    </span>

                    {item.cache_hit &&
                      item.similarity_score != null && (
                        <span className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600">
                          Similarity:{" "}
                          {(Number(item.similarity_score) * 100).toFixed(1)}%
                        </span>
                      )}
                  </div>
                </div>

                {/* AI Response */}
                <div className="border-t border-gray-200 bg-[#fffdf7] px-4 py-4 sm:px-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={15} />

                    <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                      AI Response
                    </span>
                  </div>

                  <div
                    className={`whitespace-pre-wrap break-words text-sm leading-7 text-gray-700 ${
                      !isExpanded ? "line-clamp-4" : ""
                    }`}
                  >
                    {item.response || "No response recorded."}
                  </div>

                  {/* Response Actions */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {/* Expand */}
                    <button
                      onClick={() => toggleExpanded(id)}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-gray-700 hover:text-black"
                    >
                      {isExpanded ? (
                        <>
                          Show less <ChevronUp size={15} />
                        </>
                      ) : (
                        <>
                          Read full response <ChevronDown size={15} />
                        </>
                      )}
                    </button>

                    {/* Copy Response */}
                    <button
                      onClick={() =>
                        copyText(item.response || "", `response-${id}`)
                      }
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-gray-700 hover:text-black"
                    >
                      {copied === `response-${id}` ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy response
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Confirmation Modal */}
{confirmModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-3xl border-2 border-gray-900 bg-[#fffdf7] p-6 shadow-[6px_6px_0px_#222]">

      {/* Icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gray-900 bg-[#ffe1e1]">
        <Trash2 size={30} className="text-red-600" />
      </div>

      {/* Title */}
      <h2 className="text-center font-['Patrick_Hand'] text-3xl font-bold">
        {confirmModal.type === "delete"
          ? "Delete this query?"
          : "Clear all history?"}
      </h2>

      {/* Description */}
      <p className="mt-3 text-center text-sm leading-6 text-gray-600">
        {confirmModal.type === "delete"
          ? "Are you sure you want to delete this query? This action cannot be undone."
          : "This will permanently delete all your query history. Your semantic cache will remain untouched."}
      </p>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setConfirmModal(null)}
          className="flex-1 rounded-xl border-2 border-gray-900 bg-white px-4 py-3 font-bold shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none"
        >
          Cancel
        </button>

        <button
          onClick={confirmAction}
          disabled={deletingId !== null || clearingHistory}
          className="flex-1 rounded-xl border-2 border-gray-900 bg-[#ffb4b4] px-4 py-3 font-bold text-red-900 shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none disabled:opacity-50"
        >
          {deletingId !== null || clearingHistory
            ? "Deleting..."
            : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default History;
