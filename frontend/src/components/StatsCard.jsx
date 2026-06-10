const StatsCard = ({ label, value, color }) => (
  <div className="stats-card" style={{ borderTop: `4px solid ${color}` }}>
    <p className="stats-label">{label}</p>
    <h2 className="stats-value">{value}</h2>
  </div>
);

export default StatsCard;