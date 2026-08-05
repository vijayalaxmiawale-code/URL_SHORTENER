import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Calendar, Link2, Plus, Sparkles } from "lucide-react";

export default function CreateLinkForm({ onCreated }) {
  const [form, setForm] = useState({ originalUrl: "", customAlias: "", expiresAt: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias) payload.customAlias = form.customAlias;
      if (form.expiresAt) payload.expiresAt = form.expiresAt;

      const res = await api.post("/urls/shorten", payload);
      toast.success("Link created");
      setForm({ originalUrl: "", customAlias: "", expiresAt: "" });
      onCreated?.(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm shadow-ink/5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-700">Create a short link</h2>
          <p className="mt-1 text-sm text-ink/50">Add a destination, optional alias, and expiry in one pass.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
          <Sparkles size={14} />
          QR ready
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(160px,1fr)_180px_auto]">
        <label className="group flex items-center gap-2 rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-light">
          <Link2 size={17} className="shrink-0 text-ink/35 group-focus-within:text-brand" />
          <input
            name="originalUrl"
            value={form.originalUrl}
            onChange={handleChange}
            placeholder="https://your-long-url.com/..."
            required
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </label>
        <label className="rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-light">
          <input
            name="customAlias"
            value={form.customAlias}
            onChange={handleChange}
            placeholder="custom-alias"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
          />
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-light">
          <Calendar size={17} className="shrink-0 text-ink/35" />
          <input
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleChange}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink/70 outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} />
          {loading ? "Creating..." : "Shorten"}
        </button>
      </div>
    </form>
  );
}
