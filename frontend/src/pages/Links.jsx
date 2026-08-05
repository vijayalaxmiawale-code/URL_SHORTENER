import { useEffect, useState } from "react";
import api from "../api/axios";
import LinkCard from "../components/LinkCard";
import toast from "react-hot-toast";

export default function Links() {
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this link? This cannot be undone.")) return;
    try {
      await api.delete(`/urls/${id}`);
      setLinks(links.filter((l) => l._id !== id));
      toast.success("Link deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete link");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/urls/${id}/toggle`);
      setLinks((currentLinks) =>
        currentLinks.map((link) =>
          link._id === id ? { ...link, isActive: res.data.data.isActive } : link
        )
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update link");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700">My links</h1>
        <p className="mt-1 text-sm text-ink/50">All the links you've created.</p>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Loading...</p>
      ) : links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/50">
          No links yet. Head to the dashboard to create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard key={link._id} link={link} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
