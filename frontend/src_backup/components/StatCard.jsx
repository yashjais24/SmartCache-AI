function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={22} />
      </div>

      <div className="stat-info">
        <p className="stat-title">{title}</p>
        <h2 className="stat-value">{value}</h2>

        {subtitle && (
          <p className="stat-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default StatCard;