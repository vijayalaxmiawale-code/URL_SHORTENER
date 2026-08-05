import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../api/axios";
import { ArrowLeft, Calendar, Clock, ExternalLink, MousePointerClick, QrCode } from "lucide-react";
import QRCodeModal from "../components/Dashboard/QRCodeModal";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#0891b2"];

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    api
      .get(`/urls/${id}/analytics`)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const analytics = data?.analytics;
  const recentVisits = useMemo(() => analytics?.recentVisits || [], [analytics]);

  const trendData = useMemo(() => buildTrendData(recentVisits), [recentVisits]);
  const browserData = useMemo(() => objectToChartData(analytics?.browsers), [analytics]);
  const osData = useMemo(() => objectToChartData(analytics?.operatingSystems), [analytics]);
  const deviceData = useMemo(() => objectToChartData(analytics?.devices), [analytics]);

  if (loading) return <p className="text-sm text-ink/50">Loading...</p>;
  if (!data) return <p className="text-sm text-ink/50">Link not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/links" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={16} /> Back to links
      </Link>

      <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm shadow-ink/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 break-all font-display text-2xl font-700 text-ink">{data.shortUrl}</h1>
              {data.isExpired && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                  Expired
                </span>
              )}
            </div>
            <p className="mt-2 truncate text-sm text-ink/50">{data.originalUrl}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
            >
              <QrCode size={16} />
              QR code
            </button>
            <a
              href={data.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              <ExternalLink size={16} />
              Open
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={MousePointerClick} label="Total clicks" value={analytics.totalClicks} />
        <StatCard
          icon={Clock}
          label="Last visited"
          value={analytics.lastVisited ? new Date(analytics.lastVisited).toLocaleDateString() : "No visits"}
        />
        <StatCard icon={Calendar} label="Created on" value={new Date(data.createdAt).toLocaleDateString()} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <ChartCard title="Click trend" empty={!trendData.length}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={3} fill="url(#clickGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Device mix" empty={!deviceData.length}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={deviceData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={100} paddingAngle={4}>
                {deviceData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <LegendList data={deviceData} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChartCard title="Top browsers" data={browserData} color="#2563eb" />
        <BarChartCard title="Operating systems" data={osData} color="#10b981" />
      </div>

      <VisitTimeline visits={recentVisits} />

      {showQR && <QRCodeModal shortUrl={data.shortUrl} onClose={() => setShowQR(false)} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand-dark">
        <Icon size={18} />
      </div>
      <p className="font-display text-xl font-700">{value}</p>
      <p className="text-sm text-ink/50">{label}</p>
    </div>
  );
}

function ChartCard({ title, empty, children }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5">
      <h2 className="mb-4 font-display text-lg font-700">{title}</h2>
      {empty ? (
        <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-ink/15 bg-surface text-sm text-ink/45">
          No visits yet
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function BarChartCard({ title, data, color }) {
  return (
    <ChartCard title={title} empty={!data.length}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} stroke="#64748b" tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function VisitTimeline({ visits }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5">
      <h2 className="font-display text-lg font-700">Visit timeline</h2>
      {visits.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-ink/15 bg-surface p-8 text-center text-sm text-ink/50">
          No visits yet. Share your link or QR code to start tracking clicks.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {visits.slice(0, 12).map((visit, index) => (
            <div key={`${visit.timestamp}-${index}`} className="grid gap-3 border-l-2 border-brand-light pl-4 sm:grid-cols-[160px_1fr]">
              <div>
                <p className="text-sm font-medium text-ink">{new Date(visit.timestamp).toLocaleDateString()}</p>
                <p className="text-xs text-ink/45">{new Date(visit.timestamp).toLocaleTimeString()}</p>
              </div>
              <div className="rounded-lg bg-surface px-4 py-3">
                <p className="text-sm font-medium text-ink">
                  {visit.browser || "Unknown browser"} on {visit.os || "Unknown OS"}
                </p>
                <p className="mt-1 text-xs text-ink/50">{visit.device || "Unknown device"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LegendList({ data }) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {data.map((item, index) => (
        <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-ink/60">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            {item.name}
          </span>
          <span className="font-medium text-ink">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-ink">{label}</p>}
      {payload.map((item) => (
        <p key={item.dataKey || item.name} className="text-ink/60">
          {item.name}: <span className="font-medium text-ink">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

function objectToChartData(source = {}) {
  return Object.entries(source)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function buildTrendData(visits) {
  const grouped = visits.reduce((acc, visit) => {
    const key = new Date(visit.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());

  return Array.from(grouped.entries())
    .map(([date, clicks]) => ({ date, clicks }))
    .reverse();
}
