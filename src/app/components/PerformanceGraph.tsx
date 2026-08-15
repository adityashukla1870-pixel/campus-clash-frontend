import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Mar', winRate: 0 },
  { name: 'Apr', winRate: 25 },
  { name: 'May', winRate: 5 },
  { name: 'Jun', winRate: 50 },
  { name: 'Jul', winRate: 5 },
  { name: 'Aug', winRate: 50 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #332b00', padding: '16px', borderRadius: '12px', minWidth: '120px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <p style={{ color: '#eab308', margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>{label}</p>
        <p style={{ color: '#fff', margin: 0, fontSize: '14px', fontWeight: '600' }}>
          Win Rate : {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export default function PerformanceGraph() {
  return (
    <div className="profile-details-card">
      {/* Header Section */}
      <div className="profile-details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>PERFORMANCE</h2>
        <span style={{ color: '#a3a3a3', fontSize: '14px', fontWeight: 'normal' }}>
          Last 6 months
        </span>
      </div>

      {/* Chart Section - Explicit inline height is REQUIRED for Recharts to render */}
      <div style={{ height: '240px', width: '100%' }}>
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              fill="#737373"
              fontSize={13}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              fill="#737373"
              fontSize={13}
              ticks={[0, 25, 50, 75, 100]}
              domain={[0, 100]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#d4d4d4', strokeWidth: 1.5 }}
            />

            <Area
              type="monotone"
              dataKey="winRate"
              stroke="#eab308"
              strokeWidth={3}
              fill="url(#colorWinRate)"
              fillOpacity={1}
              activeDot={{ r: 6, fill: '#fff', stroke: '#eab308', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
