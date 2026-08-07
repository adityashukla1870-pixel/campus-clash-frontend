import "./Skeleton.css"

export function SkeletonText({ width = "100%", height = 14, style }) {
  return (
    <div
      className="skel skel-text"
      style={{ width, height, ...style }}
    />
  )
}

export function SkeletonBlock({ width = "100%", height = 120, style }) {
  return (
    <div
      className="skel skel-block"
      style={{ width, height, ...style }}
    />
  )
}

export function SkeletonCircle({ size = 40, style }) {
  return (
    <div
      className="skel skel-circle"
      style={{ width: size, height: size, ...style }}
    />
  )
}

export function SkeletonButton({ width = 120, height = 40, style }) {
  return (
    <div
      className="skel skel-button"
      style={{ width, height, ...style }}
    />
  )
}

export function SkeletonBadge({ width = 60, style }) {
  return (
    <div
      className="skel skel-badge"
      style={{ width, ...style }}
    />
  )
}

export function SkeletonCard({ height = 200, style }) {
  return (
    <div className="skel-card" style={{ height, ...style }}>
      <SkeletonBlock height={height * 0.6} />
      <div style={{ padding: 12 }}>
        <SkeletonText width="70%" height={14} />
        <SkeletonText width="50%" height={12} style={{ marginTop: 8 }} />
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 6, style }) {
  return (
    <div className="skel-grid" style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonProfile({ style }) {
  return (
    <div className="skel-profile" style={style}>
      <SkeletonCircle size={64} />
      <div style={{ marginTop: 16 }}>
        <SkeletonText width="60%" height={18} />
        <SkeletonText width="40%" height={12} style={{ marginTop: 8 }} />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4, style }) {
  return (
    <div className="skel-table" style={style}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="skel-row">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <SkeletonText key={colIdx} width="80%" height={11} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonBracket({ style }) {
  return (
    <div style={style}>
      <SkeletonText width="200px" height={20} />
      <div style={{ marginTop: 16, display: "flex", gap: 24 }}>
        {[4, 2, 1].map((count, i) => (
          <div key={i}>
            {Array.from({ length: count }).map((_, j) => (
              <SkeletonBlock key={j} height={60} style={{ marginBottom: 12 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonLeaderboard({ rows = 8, style }) {
  return (
    <div style={style}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <SkeletonCircle size={32} />
          <SkeletonText width="50%" height={12} />
          <SkeletonText width="20%" height={12} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonForm({ fields = 4, style }) {
  return (
    <div style={style}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <SkeletonText width="30%" height={11} />
          <SkeletonBlock height={44} style={{ marginTop: 6 }} />
        </div>
      ))}
      <SkeletonButton width={140} height={44} />
    </div>
  )
}

export function SkeletonRoom({ style }) {
  return (
    <div style={style}>
      <SkeletonBlock height={200} style={{ borderRadius: 16 }} />
      <div style={{ marginTop: 16 }}>
        <SkeletonText width="40%" height={16} />
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <SkeletonText width="40%" height={36} />
          <SkeletonText width="40%" height={36} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonChat({ messages = 6, style }) {
  return (
    <div style={style}>
      {Array.from({ length: messages }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 12, alignSelf: i % 2 === 0 ? "flex-start" : "flex-end" }}>
          <SkeletonCircle size={24} />
          <SkeletonText width={i % 2 === 0 ? 100 : 70} height={30} />
        </div>
      ))}
    </div>
  )
}
