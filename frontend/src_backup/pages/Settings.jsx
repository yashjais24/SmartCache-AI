import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Trash2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

import {
  checkHealth,
  getCacheStats,
  clearCache
} from "../services/api";

function Settings() {
  const [health, setHealth] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setError("");

    try {
      const [healthData, cacheData] = await Promise.all([
        checkHealth(),
        getCacheStats()
      ]);

      setHealth(healthData);
      setCacheStats(cacheData);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleClearCache = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all semantic cache entries?"
    );

    if (!confirmed) return;

    setClearing(true);
    setMessage("");
    setError("");

    try {
      const result = await clearCache();

      setMessage(
        result.message || "Cache cleared successfully."
      );

      await loadSettings();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Failed to clear cache."
      );
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>System configuration and maintenance.</p>
        </div>

        <button
          className="secondary-button"
          onClick={loadSettings}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="page-loading">
          <RefreshCw className="spin" size={22} />
          Loading settings...
        </div>
      ) : (
        <>
          {error && (
            <div className="error-banner">{error}</div>
          )}

          {message && (
            <div className="success-banner">{message}</div>
          )}

          <div className="settings-grid">

            <div className="panel settings-card">

              <div className="settings-heading">
                <Server size={20} />
                <h3>Backend Status</h3>
              </div>

              <div className="settings-row">
                <span>FastAPI Server</span>

                <span
                  className={`status-pill ${
                    health?.status === "healthy"
                      ? "online"
                      : "offline"
                  }`}
                >
                  {health?.status || "Unknown"}
                </span>
              </div>

              <div className="settings-row">
                <span>API URL</span>
                <span className="settings-value">
                  localhost:8000
                </span>
              </div>

            </div>

            <div className="panel settings-card">

              <div className="settings-heading">
                <Database size={20} />
                <h3>Semantic Cache</h3>
              </div>

              <div className="settings-row">
                <span>Cached Entries</span>
                <span className="settings-value">
                  {cacheStats?.total_cached_entries ?? 0}
                </span>
              </div>

              <div className="settings-row">
                <span>Similarity Threshold</span>
                <span className="settings-value">
                  0.82 (82%)
                </span>
              </div>

              <div className="settings-row">
                <span>Vector Engine</span>
                <span className="settings-value">
                  FAISS
                </span>
              </div>

            </div>

          </div>

          <div className="panel danger-zone">

            <div className="settings-heading">
              <AlertTriangle size={20} />
              <h3>Danger Zone</h3>
            </div>

            <p>
              Clear all stored semantic cache entries.
              Query history and analytics will remain intact.
            </p>

            <button
              className="danger-button"
              onClick={handleClearCache}
              disabled={clearing}
            >
              {clearing ? (
                <RefreshCw size={16} className="spin" />
              ) : (
                <Trash2 size={16} />
              )}

              {clearing ? "Clearing..." : "Clear Semantic Cache"}
            </button>

          </div>
        </>
      )}

    </div>
  );
}

export default Settings;