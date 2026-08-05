import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Download, X } from "lucide-react";

const QRCodeModal = ({ shortUrl, onClose }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qr-code-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-ink/10 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-700 text-ink">QR code</h2>
            <p className="mt-1 text-sm text-ink/50">Ready to scan and share.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink/50 hover:bg-ink/5 hover:text-ink"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex min-h-72 items-center justify-center rounded-lg border border-ink/10 bg-surface p-5">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <QRCodeCanvas
              ref={canvasRef}
              value={shortUrl}
              size={224}
              bgColor="#ffffff"
              fgColor="#172033"
              includeMargin
              level="H"
            />
          </div>
        </div>

        <div className="mb-5">
          <p className="mb-2 text-xs font-medium uppercase text-ink/40">Short URL</p>
          <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-surface p-3">
            <code className="flex-1 break-all font-mono text-sm text-ink">{shortUrl}</code>
            <button
              onClick={handleCopy}
              className="rounded-lg p-2 text-ink/50 hover:bg-white hover:text-ink"
              title="Copy URL"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
