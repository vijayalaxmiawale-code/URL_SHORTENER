import { useEffect, useState } from "react";
import api from "../api/axios";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkCard from "../components/LinkCard";
import { useAuth } from "../context/AuthContext";
import { Clock, Link2, MousePointerClick, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const res = await api.get("/urls/user-links");
      setLinks(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const totalClicks = links.reduce((sum, l) => sum + (l.analytics?.length || l.clicks || 0), 0);
  const activeLinks = links.filter((l) => l.isActive).length;
  const recent = links.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-ink/10 bg-white p-6 shadow-sm shadow-ink/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand">Dashboard</p>
            <h1 className="mt-1 font-display text-3xl font-700">
              Hi, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-1 text-sm text-ink/50">
              Create QR-enabled links and monitor engagement from one place.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-lg bg-surface px-4 py-3 text-sm text-ink/60">
            <TrendingUp size={18} className="text-brand" />
            {totalClicks} tracked clicks
          </div>
        </div>
      </div>

      <CreateLinkForm onCreated={(newLink) => setLinks([{ ...newLink, analytics: [], isActive: true }, ...links])} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Link2} label="Total links" value={links.length} accent="bg-blue-50 text-blue-700" />
        <StatCard icon={MousePointerClick} label="Total clicks" value={totalClicks} accent="bg-emerald-50 text-emerald-700" />
        <StatCard icon={Clock} label="Active links" value={activeLinks} accent="bg-amber-50 text-amber-700" />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-700">Recent links</h2>
        {loading ? (
          <p className="text-sm text-ink/50">Loading...</p>
        ) : recent.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/50">
            You haven't created any links yet. Add one above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((link) => (
              <LinkCard key={link._id || link.id} link={{ ...link, _id: link._id || link.id }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
        <Icon size={18} />
      </div>
      <p className="font-display text-2xl font-700">{value}</p>
      <p className="text-sm text-ink/50">{label}</p>
    </div>
  );
}
