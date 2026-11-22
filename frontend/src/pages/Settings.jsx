
import { useEffect, useState } from "react";
import { getCacheStats, clearCache } from "../services/api";

import {
  Settings as SettingsIcon,
  Database,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Zap,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const cardStyle =
  "rounded-2xl border-2 border-gray-900 bg-white shadow-[3px_3px_0px_#222]";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-semibold text-gray-500">
        {label}
      </span>

      <span className="break-all text-sm font-bold text-gray-900 sm:text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

function Settings() {
  const [cacheStats, setCacheStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setSuccess("");

    try {
      const data = await getCacheStats();
      setCacheStats(data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to fetch cache statistics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleClearCache = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear the semantic cache? Cached responses will be removed."
    );

    if (!confirmed) return;

    setClearing(true);
    setError("");
    setSuccess("");

    try {
      await clearCache();

      setSuccess("Semantic cache cleared successfully!");

      await loadSettings(true);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Failed to clear cache."
      );
    } finally {
      setClearing(false);
    }
  };

  const getValue = (object, possibleKeys) => {
    if (!object) return "—";

    for (const key of possibleKeys) {
      if (
        object[key] !== undefined &&
        object[key] !== null
      ) {
        return object[key];
      }
    }

    return "—";
  };

  const cacheEntries = getValue(cacheStats, [
  "cached_entries",
  "total_entries",
  "cache_size",
  "total_cached",
  "total_cached_items",
  "cache_count",
  "size",
  "count",
]);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon size={22} />

            <h1 className="font-['Patrick_Hand'] text-4xl font-bold">
              Settings
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Manage your SmartCache system and preferences.
          </p>
        </div>

        <button
          onClick={() => loadSettings(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border-2 border-gray-900 bg-[#fff0bd] px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex gap-3 rounded-xl border-2 border-red-400 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex gap-3 rounded-xl border-2 border-emerald-400 bg-[#d9f3e3] p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          {success}
        </div>
      )}

      {/* Semantic Cache */}
      <div className={`${cardStyle} p-5 sm:p-6`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-900 bg-[#e6ddff]">
            <Database size={22} />
          </div>

          <div>
            <h2 className="font-['Patrick_Hand'] text-2xl font-bold">
              Semantic Cache
            </h2>

            <p className="text-xs text-gray-500">
              Cache storage and statistics
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          </div>
        ) : cacheStats ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-gray-900 bg-[#e6ddff] p-4">
                <p className="text-sm font-bold text-gray-600">
                  Cached Entries
                </p>

                <h3 className="mt-2 text-3xl font-black">
                  {cacheEntries}
                </h3>
              </div>

              <div className="rounded-xl border-2 border-gray-900 bg-[#d9f3e3] p-4">
                <p className="text-sm font-bold text-gray-600">
                  Cache System
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Active
                </h3>
              </div>
            </div>

            <div className="mt-4">
              {Object.entries(cacheStats).map(([key, value]) => (
                <InfoRow
                  key={key}
                  label={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={
                    typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-gray-500">
            No cache statistics available.
          </p>
        )}
      </div>

      {/* Model Routing */}
      <div className={`${cardStyle} p-5 sm:p-6`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gray-900 bg-[#fff0bd]">
            <Cpu size={22} />
          </div>

          <div>
            <h2 className="font-['Patrick_Hand'] text-2xl font-bold">
              Model Routing
            </h2>

            <p className="text-xs text-gray-500">
              Models configured for intelligent query routing
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Simple queries */}
          <div className="rounded-xl border-2 border-gray-900 bg-[#d9f3e3] p-4">
            <div className="flex items-center gap-2">
              <Zap size={17} />

              <span className="text-xs font-extrabold uppercase tracking-wide">
                Simple Queries
              </span>
            </div>

            <p className="mt-2 break-all text-sm font-bold">
              liquid/lfm-3-1.7b:free
            </p>

            <p className="mt-2 text-xs leading-5 text-gray-600">
              Lightweight model for simple queries with efficient
              inference.
            </p>
          </div>

          {/* Complex queries */}
          <div className="rounded-xl border-2 border-gray-900 bg-[#e6ddff] p-4">
            <div className="flex items-center gap-2">
              <Sparkles size={17} />

              <span className="text-xs font-extrabold uppercase tracking-wide">
                Complex Queries
              </span>
            </div>

            <p className="mt-2 break-all text-sm font-bold">
            Groq · GPT-OSS 120B
            </p>

<p className="mt-2 text-xs leading-5 text-gray-600">
  High-performance model for complex reasoning, coding,
  and advanced queries.
</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border-2 border-red-500 bg-[#fff1f1] p-5 shadow-[3px_3px_0px_#b91c1c] sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-red-500 bg-white">
            <Trash2 size={22} className="text-red-600" />
          </div>

          <div>
            <h2 className="font-['Patrick_Hand'] text-2xl font-bold text-red-700">
              Danger Zone
            </h2>

            <p className="text-xs text-red-600">
              Destructive cache operations
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold">
              Clear Semantic Cache
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Remove cached query-response entries. Your query history
              will not be deleted.
            </p>
          </div>

          <button
            onClick={handleClearCache}
            disabled={clearing || loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-red-600 bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_#991b1b] transition hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={17} />

            {clearing ? "Clearing..." : "Clear Cache"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 pb-3 text-xs text-gray-400">
        <ShieldCheck size={14} />
        SmartCache AI · System Settings
      </div>
    </div>
  );
}

export default Settings;
