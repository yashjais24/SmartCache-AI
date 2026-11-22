
import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  Zap,
  Clock,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Brain,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import {
  getOverview,
  getModelUsage,
  getHistory,
} from "../services/api";

import "./doodle.css";

const COLORS = ["#8bd3a7", "#ffb5a7"];

function Dashboard() {
  const [overview, setOverview] = useState({
    total_queries: 0,
    cache_hits: 0,
    cache_misses: 0,
    cache_hit_rate: 0,
    average_latency_ms: 0,
    total_latency_ms: 0,
    total_estimated_cost: 0,
  });

  const [models, setModels] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // LOAD DASHBOARD DATA
  // =========================================

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewData, modelData, historyData] =
        await Promise.all([
          getOverview(),
          getModelUsage(),
          getHistory(5),
        ]);

      // Overview is a plain object
      setOverview(
        overviewData ?? {
          total_queries: 0,
          cache_hits: 0,
          cache_misses: 0,
          cache_hit_rate: 0,
          average_latency_ms: 0,
          total_latency_ms: 0,
          total_estimated_cost: 0,
        }
      );

      // Models API may return { value: [...] }
      setModels(
        Array.isArray(modelData)
          ? modelData
          : modelData?.value ?? []
      );

      // History API may return { value: [...] }
      setHistory(
        Array.isArray(historyData)
          ? historyData
          : historyData?.value ?? []
      );
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================================
  // CHART DATA
  // =========================================

  const chartData = [
    {
      name: "Cache Hits",
      value: overview.cache_hits || 0,
    },
    {
      name: "Cache Misses",
      value: overview.cache_misses || 0,
    },
  ];

  // =========================================
  // STATS
  // =========================================

  const stats = [
    {
      label: "Total Queries",
      value: overview.total_queries ?? 0,
      icon: Activity,
      color: "mint",
      note: "All queries processed",
    },
    {
      label: "Cache Hit Rate",
      value: `${overview.cache_hit_rate ?? 0}%`,
      icon: Database,
      color: "lavender",
      note: `${overview.cache_hits ?? 0} cached responses`,
    },
    {
      label: "Average Latency",
      value: `${overview.average_latency_ms ?? 0} ms`,
      icon: Clock,
      color: "yellow",
      note: "Average response time",
    },
    {
      label: "Estimated Cost",
      value: `$${Number(
        overview.total_estimated_cost ?? 0
      ).toFixed(6)}`,
      icon: Zap,
      color: "pink",
      note: "Total estimated API cost",
    },
  ];

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="doodle-loading">
        <div className="loading-sketch">
          <RefreshCw className="spin" size={28} />
        </div>

        <p>Gathering your little AI stats...</p>
      </div>
    );
  }

  // =========================================
  // DASHBOARD
  // =========================================

  return (
    <div className="doodle-dashboard">

      {/* HEADER */}
      <div className="doodle-header">
        <div>
          <div className="doodle-eyebrow">
            <Sparkles size={14} />
            YOUR AI WORKSPACE
          </div>

          <h1>
            Dashboard
            <span className="title-doodle"> ✦</span>
          </h1>

          <p className="doodle-subtitle">
            A little overview of your AI's performance.
          </p>
        </div>

        <button
          className="doodle-button"
          onClick={loadDashboard}
        >
          <RefreshCw size={16} />
          Refresh stats
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="doodle-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="doodle-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              className={`doodle-stat-card ${stat.color}`}
              style={{
                "--card-rotation": [
                  "-1deg",
                  "1deg",
                  "-0.5deg",
                  "0.8deg",
                ][index],
              }}
              key={stat.label}
            >
              <div className="doodle-stat-top">
                <div className="doodle-stat-icon">
                  <Icon size={20} />
                </div>

                <span className="doodle-card-number">
                  0{index + 1}
                </span>
              </div>

              <div className="doodle-stat-label">
                {stat.label}
              </div>

              <div className="doodle-stat-value">
                {stat.value}
              </div>

              <div className="doodle-stat-note">
                <span>✦</span> {stat.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <div className="doodle-content-grid">

        {/* CACHE PERFORMANCE */}
        <div className="doodle-panel">
          <div className="doodle-panel-header">
            <div>
              <h2>
                <span className="heading-scribble">
                  Cache performance
                </span>
              </h2>

              <p>Hits vs misses · Your cache efficiency</p>
            </div>

            <div className="doodle-badge">
              {overview.cache_hit_rate ?? 0}% hit rate
            </div>
          </div>

          {overview.total_queries === 0 ? (
            <div className="doodle-empty">
              <div className="empty-drawing">♡</div>
              <p>No data yet!</p>
              <span>Send your first query to see analytics.</span>
            </div>
          ) : (
            <>
              <div className="doodle-chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      stroke="#292824"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="doodle-chart-center">
                  <strong>
                    {overview.cache_hit_rate ?? 0}%
                  </strong>

                  <span>cached ✨</span>
                </div>
              </div>

              <div className="doodle-legend">
                <div className="legend-item">
                  <span className="legend-swatch hit-swatch" />

                  <div>
                    <strong>
                      {overview.cache_hits ?? 0} Hits
                    </strong>

                    <span>Instant cached answers</span>
                  </div>
                </div>

                <div className="legend-item">
                  <span className="legend-swatch miss-swatch" />

                  <div>
                    <strong>
                      {overview.cache_misses ?? 0} Misses
                    </strong>

                    <span>New AI generations</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="doodle-note">
            ✏️ Every cache hit means less waiting and fewer AI calls!
          </div>
        </div>

        {/* MODEL USAGE */}
        <div className="doodle-panel">
          <div className="doodle-panel-header">
            <div>
              <h2>
                <span className="heading-scribble">
                  Model usage
                </span>
              </h2>

              <p>Which AI models are doing the work?</p>
            </div>

            <Brain
              size={22}
              className="doodle-heading-icon"
            />
          </div>

          {models.length === 0 ? (
            <div className="doodle-empty">
              <div className="empty-drawing">☁</div>
              <p>No model data yet!</p>
              <span>Models will appear after queries.</span>
            </div>
          ) : (
            <div className="doodle-model-list">
              {models.map((model, index) => {
                const maxRequests = Math.max(
                  ...models.map((m) => m.total_requests || 0),
                  1
                );

                const percentage =
                  ((model.total_requests || 0) /
                    maxRequests) *
                  100;

                return (
                  <div
                    className="doodle-model-item"
                    key={model.model_name}
                  >
                    <div className="model-avatar">
                      {index === 0
                        ? "✨"
                        : index === 1
                        ? "🧠"
                        : "⚡"}
                    </div>

                    <div className="doodle-model-details">
                      <strong>{model.model_name}</strong>

                      <div className="doodle-model-meta">
                        {model.total_requests} requests ·{" "}
                        {Number(
                          model.average_latency_ms ?? 0
                        ).toFixed(0)}{" "}
                        ms avg
                      </div>

                      <div className="model-progress-track">
                        <div
                          className="model-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="doodle-model-cost">
                      $
                      {Number(
                        model.estimated_cost ?? 0
                      ).toFixed(6)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="doodle-note lavender-note">
            🪄 Smart routing chooses a model based on query complexity.
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="doodle-panel recent-panel">
        <div className="doodle-panel-header">
          <div>
            <h2>
              <span className="heading-scribble">
                Recent activity
              </span>
            </h2>

            <p>Your latest conversations with SmartCache AI</p>
          </div>

          <div className="activity-decoration">
            <TrendingUp size={18} />
            <span>Latest 5</span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="doodle-empty">
            <div className="empty-drawing">✎</div>
            <p>Your story starts here!</p>
            <span>Ask something in Chat to see it here.</span>
          </div>
        ) : (
          <div className="doodle-activity-list">
            {history.map((item, index) => (
              <div
                className="doodle-activity-item"
                key={item.id}
              >
                <div className="activity-index">
                  0{index + 1}
                </div>

                <div className="activity-main">
                  <div className="activity-query">
                    {item.query}
                  </div>

                  <div className="activity-meta">
                    <span
                      className={`doodle-cache-badge ${
                        item.cache_hit ? "hit" : "miss"
                      }`}
                    >
                      {item.cache_hit
                        ? "✓ CACHE HIT"
                        : "↗ CACHE MISS"}
                    </span>

                    <span className="activity-model">
                      {item.model_used}
                    </span>

                    <span className="activity-latency">
                      <Clock size={12} />

                      {Number(
                        item.latency_ms ?? 0
                      ).toFixed(0)}{" "}
                      ms
                    </span>

                    {item.cache_hit && (
                      <span className="activity-latency">
                        <Sparkles size={12} />

                        {(
                          (item.similarity_score ?? 0) *
                          100
                        ).toFixed(1)}
                        % similarity
                      </span>
                    )}
                  </div>
                </div>

                <ArrowUpRight
                  size={17}
                  className="activity-arrow"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="doodle-footer">
        <span className="footer-stars">✦ ✧ ✦</span>
        <span>Made with a little AI magic</span>
        <span className="footer-stars">✦ ✧ ✦</span>
      </div>
    </div>
  );
}

export default Dashboard;
