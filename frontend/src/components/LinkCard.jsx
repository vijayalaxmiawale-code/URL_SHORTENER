import { Link } from "react-router-dom";
import { useState } from "react";
import { Copy, Trash2, ExternalLink, BarChart2, Power, QrCode } from "lucide-react";
import toast from "react-hot-toast";
import QRCodeModal from "./Dashboard/QRCodeModal";

export default function LinkCard({ link, onDelete, onToggle }) {
  const [showQR, setShowQR] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(link.shortUrl);
    toast.success("Copied to clipboard");
  };

  const isExpired =
    link.isExpired ?? (link.expiresAt && new Date(link.expiresAt) <= new Date());

  return (
    <>
      <div className="grid gap-4 rounded-lg border border-ink/10 bg-white p-4 shadow-sm shadow-ink/5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 truncate font-medium text-brand hover:text-brand-dark"
            >
              {link.shortUrl.replace(/^https?:\/\//, "")}
            </a>
            {isExpired && (
              <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                Expired
              </span>
            )}
            {!link.isActive && !isExpired && (
              <span className="shrink-0 rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink/50">
                Disabled
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-ink/50">{link.originalUrl}</p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <div className="rounded-lg bg-surface px-3 py-2 text-right">
            <p className="font-display text-lg font-700">{link.analytics?.length ?? link.clicks ?? 0}</p>
            <p className="text-xs text-ink/40">clicks</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={copy} title="Copy link" className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink">
              <Copy size={16} />
            </button>
            <button onClick={() => setShowQR(true)} title="Show QR code" className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink">
              <QrCode size={16} />
            </button>
            <a href={link.shortUrl} target="_blank" rel="noreferrer" title="Open" className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink">
              <ExternalLink size={16} />
            </a>
            <Link to={`/links/${link._id}`} title="Analytics" className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink">
              <BarChart2 size={16} />
            </Link>
            {onToggle && (
              <button
                onClick={() => onToggle(link._id)}
                title={link.isActive ? "Disable link" : "Enable link"}
                className={`rounded-lg p-2 hover:bg-ink/5 ${link.isActive ? "text-green-600" : "text-ink/30"}`}
              >
                <Power size={16} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(link._id)} title="Delete" className="rounded-lg p-2 text-ink/50 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {showQR && <QRCodeModal shortUrl={link.shortUrl} onClose={() => setShowQR(false)} />}
    </>
  );
}
