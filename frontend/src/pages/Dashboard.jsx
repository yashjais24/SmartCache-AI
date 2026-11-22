
import { useEffect, useState } from "react";
import {
  getOverview,
  getModelUsage,
  getHistory,
  getCacheStats,
} from "../services/api";

import {
  Activity,
  Database,
  Zap,
  MessageSquare,
  Clock,
  DollarSign,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#a78bfa", "#86efac", "#fcd34d", "#f9a8d4"];

const cardStyle =
  "rounded-2xl border-2 border-gray-900 bg-white shadow-[4px_4px_0px_#222]";

const normalize = (data) => {
  if (Array.isArray(data)) return data;
  return data?.value ?? data?.data ?? [];
};

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className={`${cardStyle} relative overflow-hidden p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-500">{title}</p>
          <h2 className="mt-2 text-3xl font-black text-gray-900">
            {value}
          </h2>
          <p className="mt-2 text-xs font-semibold text-gray-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-gray-900 ${color}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, emoji }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 font-['Patrick_Hand'] text-2xl font-bold">
        <span>{emoji}</span>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [models, setModels] = useState([]);
  const [history, setHistory] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewData, modelData, historyData, cacheData] =
        await Promise.all([
          getOverview(),
          getModelUsage(),
          getHistory(5),
          getCacheStats(),
        ]);

      setOverview(overviewData);
      setModels(normalize(modelData));
      setHistory(normalize(historyData));
      setCacheStats(cacheData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data. Check whether your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalQueries = overview?.total_queries ?? 0;
  const cacheHits = overview?.cache_hits ?? 0;
  const cacheMisses = overview?.cache_misses ?? 0;
  const hitRate = overview?.cache_hit_rate ?? 0;
  const avgLatency = overview?.average_latency_ms ?? 0;
  const totalCost = overview?.total_estimated_cost ?? 0;

  const cacheChartData = [
    { name: "Cache Hits", value: cacheHits },
    { name: "Cache Misses", value: cacheMisses },
  ];

  const modelChartData = models.map((model) => ({
    name: model.model_name?.split("/").pop() || "Unknown model",
    requests: model.total_requests ?? 0,
    hits: model.cache_hits ?? 0,
    misses: model.cache_misses ?? 0,
  }));

  const recentChartData = [...history]
    .reverse()
    .map((item, index) => ({
      name: `Q${index + 1}`,
      latency: Number(item.latency_ms || 0),
    }));

  const formatLatency = (ms) => {
    if (!ms) return "0 ms";
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const formatCost = (cost) => {
    return `$${Number(cost || 0).toFixed(6)}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          <h2 className="font-['Patrick_Hand'] text-2xl font-bold">
            Loading your dashboard...
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Fetching your SmartCache analytics
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <div className={`${cardStyle} bg-[#ffe1e1] p-8 text-center`}>
          <XCircle className="mx-auto mb-4" size={42} />
          <h2 className="font-['Patrick_Hand'] text-3xl font-bold">
            Dashboard unavailable
          </h2>
          <p className="mt-3 text-sm text-gray-700">{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-gray-900 bg-white px-5 py-3 font-bold shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={22} />
            <h1 className="font-['Patrick_Hand'] text-4xl font-bold">
              Dashboard
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Your SmartCache AI performance at a glance.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border-2 border-gray-900 bg-[#fff0bd] px-4 py-3 text-sm font-bold shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none sm:self-auto"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Queries"
          value={totalQueries.toLocaleString()}
          subtitle="Queries processed"
          icon={MessageSquare}
          color="bg-[#e6ddff]"
        />

        <StatCard
          title="Cache Hit Rate"
          value={`${Number(hitRate).toFixed(1)}%`}
          subtitle={`${cacheHits} cached responses`}
          icon={Database}
          color="bg-[#d9f3e3]"
        />

        <StatCard
          title="Avg. Latency"
          value={formatLatency(avgLatency)}
          subtitle="Average response time"
          icon={Clock}
          color="bg-[#fff0bd]"
        />

        <StatCard
          title="Estimated Cost"
          value={formatCost(totalCost)}
          subtitle="Total API cost recorded"
          icon={DollarSign}
          color="bg-[#ffddeb]"
        />
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Latency chart */}
        <div className={`${cardStyle} min-w-0 p-5 xl:col-span-2`}>
          <SectionTitle
            title="Recent Response Performance"
            subtitle="Response latency across recent queries"
            emoji="⚡"
          />

          {recentChartData.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recentChartData}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e5e7eb"
                  />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis
                    stroke="#6b7280"
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${(value / 1000).toFixed(1)}s`
                        : `${value}ms`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatLatency(value),
                      "Latency",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="#8b5cf6"
                    fill="#e6ddff"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
              No query data available yet
            </div>
          )}
        </div>

        {/* Cache distribution */}
        <div className={`${cardStyle} min-w-0 p-5`}>
          <SectionTitle
            title="Cache Distribution"
            subtitle="Hits versus misses"
            emoji="🍰"
          />

          {totalQueries > 0 ? (
            <>
              <div className="relative h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cacheChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                    >
                      <Cell fill="#86efac" />
                      <Cell fill="#fcd34d" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">
                    {Number(hitRate).toFixed(0)}%
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    Hit rate
                  </span>
                </div>
              </div>

              <div className="mt-2 flex justify-center gap-5">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="h-3 w-3 rounded-full bg-[#86efac]" />
                  Hits ({cacheHits})
                </div>

                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="h-3 w-3 rounded-full bg-[#fcd34d]" />
                  Misses ({cacheMisses})
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
              No cache activity yet
            </div>
          )}
        </div>
      </div>

      {/* Model analytics */}
      <div className={`${cardStyle} min-w-0 p-5`}>
        <SectionTitle
          title="Model Usage"
          subtitle="Requests handled by each model"
          emoji="🤖"
        />

        {modelChartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="4 4" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="requests"
                  fill="#a78bfa"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">
            No model usage data available
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className={`${cardStyle} min-w-0 overflow-hidden`}>
        <div className="p-5 pb-3">
          <SectionTitle
            title="Recent Queries"
            subtitle="Your latest AI interactions"
            emoji="📝"
          />
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-[#fff0bd]">
                <tr className="border-y-2 border-gray-900">
                  <th className="px-5 py-3 text-xs font-black uppercase">
                    Query
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase">
                    Model
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase">
                    Latency
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => (
                  <tr
                    key={item.id ?? index}
                    className="border-b border-gray-200 transition hover:bg-[#fffdf7]"
                  >
                    <td className="max-w-[300px] px-5 py-4">
                      <p className="truncate text-sm font-bold">
                        {item.query || "Untitled query"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {item.cache_hit ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d9f3e3] px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 size={13} />
                          Hit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0bd] px-2.5 py-1 text-xs font-bold text-amber-800">
                          <Zap size={13} />
                          Miss
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="max-w-[180px] truncate text-xs font-semibold text-gray-600">
                        {item.model_used?.split("/").pop() || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm font-bold">
                      {formatLatency(Number(item.latency_ms || 0))}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 pb-8 text-center text-sm text-gray-400">
            No queries yet. Start chatting to see your activity here!
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 pb-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} />
          SmartCache analytics
        </div>

        <span>
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString()}`
            : "Data not refreshed"}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
