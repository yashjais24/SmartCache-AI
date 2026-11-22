
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Clock,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Database,
  MessageSquare,
} from "lucide-react";

import { getHistory } from "../services/api";

function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getHistory(100);

      const historyData = Array.isArray(data)
        ? data
        : Array.isArray(data?.value)
          ? data.value
          : [];

      setRecords(historyData);
    } catch (err) {
      console.error("History loading error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to load query history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const safeRecords = Array.isArray(records) ? records : [];

  const filteredRecords = useMemo(() => {
    return safeRecords.filter((item) => {
      if (!item) return false;

      const searchTerm = search.toLowerCase();

      const query = String(item.query ?? "").toLowerCase();
      const response = String(item.response ?? "").toLowerCase();
      const model = String(item.model_used ?? "").toLowerCase();

      const matchesSearch =
        query.includes(searchTerm) ||
        response.includes(searchTerm) ||
        model.includes(searchTerm);

      const matchesFilter =
        filter === "all" ||
        (filter === "hit" && Boolean(item.cache_hit)) ||
        (filter === "miss" && !item.cache_hit);

      return matchesSearch && matchesFilter;
    });
  }, [safeRecords, search, filter]);

  const hitCount = safeRecords.filter(
    (item) => item?.cache_hit
  ).length;

  const missCount = safeRecords.length - hitCount;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text ?? "");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((previous) => (previous === id ? null : id));
  };

  const formatLatency = (value) => {
    const number = Number(value ?? 0);
    return Number.isFinite(number) ? number.toFixed(0) : "0";
  };

  const formatSimilarity = (value) => {
    const number = Number(value ?? 0);

    return Number.isFinite(number)
      ? (number * 100).toFixed(1)
      : "0.0";
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf7] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="animate-spin text-violet-500 mx-auto mb-4"
          />

          <p className="font-['Patrick_Hand'] text-2xl text-gray-700">
            Looking through your notebook...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffdf7] px-6 py-8 sm:px-8 lg:px-12 xl:px-16">

      {/* PAGE HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">

        <div>
          <div className="flex items-center gap-2 text-violet-600 font-bold text-xs tracking-[0.18em] uppercase mb-3">
            <Sparkles size={15} />
            Your AI Notebook
          </div>

          <h1 className="font-['Patrick_Hand'] text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight">
            Query History
            <span className="text-violet-500 ml-3">✎</span>
          </h1>

          <p className="text-gray-500 text-base mt-2">
            Every question, every answer, all in one place.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="flex items-center justify-center gap-2 px-5 py-3
          border-2 border-gray-900 rounded-xl bg-white
          shadow-[4px_4px_0px_#222]
          hover:shadow-[6px_6px_0px_#222] hover:-translate-y-0.5
          active:translate-y-0 active:shadow-[2px_2px_0px_#222]
          transition-all font-bold text-sm self-start sm:self-center"
        >
          <RefreshCw size={16} />
          Refresh
        </button>

      </header>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">

        {/* TOTAL QUERIES */}
        <div className="relative bg-[#d9f3e3] border-2 border-gray-900 rounded-2xl p-6
          shadow-[5px_5px_0px_#222] hover:-translate-y-1 transition-transform">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare size={21} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">
                Total queries
              </p>

              <p className="font-['Patrick_Hand'] text-4xl font-bold text-gray-900">
                {safeRecords.length}
              </p>
            </div>

          </div>

          <span className="absolute top-4 right-5 text-2xl opacity-40">
            ✦
          </span>
        </div>

        {/* CACHE HITS */}
        <div className="relative bg-[#e6ddff] border-2 border-gray-900 rounded-2xl p-6
          shadow-[5px_5px_0px_#222] hover:-translate-y-1 transition-transform">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center shrink-0">
              <Database size={21} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">
                Cache hits
              </p>

              <p className="font-['Patrick_Hand'] text-4xl font-bold text-gray-900">
                {hitCount}
              </p>
            </div>

          </div>

          <span className="absolute top-4 right-5 text-2xl opacity-40">
            ✓
          </span>
        </div>

        {/* CACHE MISSES */}
        <div className="relative bg-[#fff0bd] border-2 border-gray-900 rounded-2xl p-6
          shadow-[5px_5px_0px_#222] hover:-translate-y-1 transition-transform">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 bg-white border-2 border-gray-900 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={21} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600">
                Cache misses
              </p>

              <p className="font-['Patrick_Hand'] text-4xl font-bold text-gray-900">
                {missCount}
              </p>
            </div>

          </div>

          <span className="absolute top-4 right-5 text-2xl opacity-40">
            ↗
          </span>
        </div>

      </section>

      {/* SEARCH + FILTERS */}
      <section className="flex flex-col xl:flex-row gap-4 mb-8">

        {/* SEARCH */}
        <div className="flex-1 relative">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            placeholder="Search queries, responses or models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-gray-900 rounded-xl
            pl-12 pr-12 py-4 outline-none
            shadow-[4px_4px_0px_#222]
            focus:shadow-[6px_6px_0px_#222]
            transition-all text-sm sm:text-base"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2
              text-gray-500 hover:text-gray-900 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="flex gap-3 flex-wrap">

          {[
            { label: "All", value: "all" },
            { label: "Cache Hits", value: "hit" },
            { label: "Cache Misses", value: "miss" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-5 py-3 rounded-xl border-2 border-gray-900
              font-bold text-sm transition-all whitespace-nowrap
              ${
                filter === option.value
                  ? "bg-gray-900 text-white shadow-[4px_4px_0px_#a78bfa]"
                  : "bg-white text-gray-900 shadow-[4px_4px_0px_#222] hover:-translate-y-0.5"
              }`}
            >
              {option.label}
            </button>
          ))}

        </div>

      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-8 p-5 border-2 border-red-500 rounded-xl bg-red-50 text-red-700 font-medium">
          ⚠️ {error}

          <button
            onClick={loadHistory}
            className="ml-3 underline font-bold"
          >
            Try again
          </button>
        </div>
      )}

      {/* RESULTS INFO */}
      <div className="flex items-center justify-between mb-6 text-sm text-gray-600">

        <span>
          Showing{" "}
          <strong className="text-gray-900 text-base">
            {filteredRecords.length}
          </strong>{" "}
          queries
        </span>

        <span className="text-violet-400 font-['Patrick_Hand'] text-xl">
          ✧ ─ ✧
        </span>

      </div>

      {/* HISTORY RESULTS */}
      {filteredRecords.length === 0 ? (

        <div className="border-2 border-dashed border-gray-400 rounded-2xl
          p-10 sm:p-16 text-center bg-white/70">

          <div className="text-6xl mb-5">☁</div>

          <h3 className="font-['Patrick_Hand'] text-3xl sm:text-4xl text-gray-900 mb-3">
            {safeRecords.length === 0
              ? "Your notebook is empty!"
              : "No matching queries"}
          </h3>

          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            {safeRecords.length === 0
              ? "Start chatting with SmartCache AI and your queries will appear here."
              : "Try another search term or filter."}
          </p>

        </div>

      ) : (

        <div className="space-y-6">

          {filteredRecords.map((item, index) => {
            const id = item.id ?? index;
            const isExpanded = expandedId === id;
            const cacheHit = Boolean(item.cache_hit);

            return (
              <article
                key={id}
                className={`bg-white border-2 border-gray-900 rounded-2xl
                p-5 sm:p-6 lg:p-7
                shadow-[5px_5px_0px_#222]
                hover:shadow-[7px_7px_0px_#222]
                transition-all
                ${
                  cacheHit
                    ? "border-l-[9px] border-l-emerald-400"
                    : "border-l-[9px] border-l-orange-400"
                }`}
              >

                {/* CARD HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                  <div className="flex items-center gap-3 flex-wrap">

                    <span
                      className={`px-3 py-2 rounded-full border-2 border-gray-900
                      text-xs font-extrabold
                      ${
                        cacheHit
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {cacheHit ? "✓ CACHE HIT" : "↗ CACHE MISS"}
                    </span>

                    <span className="text-xs font-mono text-gray-400">
                      #{item.id ?? "—"}
                    </span>

                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={15} />
                    {formatDate(item.created_at)}
                  </div>

                </div>

                {/* QUERY */}
                <div className="mb-5">

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed break-words">
                    {item.query || "Untitled query"}
                  </h3>

                </div>

                {/* METADATA */}
                <div className="flex flex-wrap gap-3 mb-5">

                  <span className="inline-flex items-center gap-2 px-3 py-2
                    rounded-lg bg-violet-100 border border-violet-300
                    text-violet-800 text-xs sm:text-sm font-semibold break-all">
                    <Sparkles size={14} />
                    {item.model_used || "Unknown model"}
                  </span>

                  <span className="inline-flex items-center gap-2 px-3 py-2
                    rounded-lg bg-blue-100 border border-blue-300
                    text-blue-800 text-xs sm:text-sm font-semibold">
                    <Clock size={14} />
                    {formatLatency(item.latency_ms)} ms
                  </span>

                  {cacheHit && (
                    <span className="inline-flex items-center gap-2 px-3 py-2
                      rounded-lg bg-emerald-100 border border-emerald-300
                      text-emerald-800 text-xs sm:text-sm font-semibold">
                      <Database size={14} />
                      {formatSimilarity(item.similarity_score)}% match
                    </span>
                  )}

                </div>

                {/* RESPONSE */}
                <div className="bg-[#faf8ff] border-2 border-gray-200 rounded-xl p-4 sm:p-5">

                  <div className="flex items-center justify-between gap-3 mb-4">

                    <span className="font-['Patrick_Hand'] text-xl font-bold text-gray-700">
                      ✎ AI RESPONSE
                    </span>

                    <button
                      onClick={() => copyText(item.response)}
                      title="Copy response"
                      className="flex items-center gap-2 px-3 py-2
                      rounded-lg border-2 border-gray-300 bg-white
                      hover:border-gray-900 hover:bg-gray-50
                      text-sm font-bold transition-colors"
                    >
                      <Copy size={14} />
                      Copy
                    </button>

                  </div>

                  <div
                    className={`text-sm sm:text-base text-gray-700 leading-7 whitespace-pre-wrap break-words
                    ${
                      isExpanded
                        ? ""
                        : "max-h-36 overflow-hidden"
                    }`}
                  >
                    {item.response || "No response available."}
                  </div>

                </div>

                {/* EXPAND */}
                <button
                  onClick={() => toggleExpand(id)}
                  className="flex items-center gap-2 mt-5
                  text-sm font-bold text-violet-700
                  hover:text-violet-900 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      Show less
                      <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      View full response
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>

              </article>
            );
          })}

        </div>

      )}

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-3 mt-12 mb-8 text-gray-400">
        <span>✦</span>

        <span className="font-['Patrick_Hand'] text-xl">
          Your questions make SmartCache smarter.
        </span>

        <span>✦</span>
      </div>

    </div>
  );
}

export default History;
