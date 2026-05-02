import { useEffect, useState } from "react";
import { getTool, type Tool } from "./lib/api.js";
import { StatusBadge } from "./ui.js";

type Tab = "overview" | "research" | "generated" | "publish";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "research",   label: "Research" },
  { id: "generated",  label: "Generated Content" },
  { id: "publish",    label: "Publish Preview" },
];

interface Props {
  toolId: string;
  onBack: () => void;
}

export function ToolDetail({ toolId, onBack }: Props) {
  const [tool, setTool] = useState<Tool | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setLoadStatus("loading");
    getTool(toolId)
      .then(({ tool }) => { setTool(tool); setLoadStatus("ok"); })
      .catch((e) => {
        setLoadError(e instanceof Error ? e.message : "Failed to load tool");
        setLoadStatus("error");
      });
  }, [toolId]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <button
          onClick={onBack}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>

        {loadStatus === "loading" && <p className="text-sm text-slate-500">Loading…</p>}
        {loadStatus === "error" && <p className="text-sm text-red-600">{loadError}</p>}

        {loadStatus === "ok" && tool && (
          <>
            <header className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{tool.name}</h1>
              <StatusBadge status={tool.status} />
            </header>

            {/* Tab bar */}
            <nav className="flex gap-1 border-b border-slate-200">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    tab === id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {tab === "overview"  && <OverviewTab tool={tool} />}
            {tab === "research"  && <Placeholder>Research runs will appear here once the research feature is implemented.</Placeholder>}
            {tab === "generated" && <Placeholder>Generated content will appear here once the generation feature is implemented.</Placeholder>}
            {tab === "publish"   && <Placeholder>Publish preview will appear here once the publish feature is implemented.</Placeholder>}
          </>
        )}

      </div>
    </main>
  );
}

// ---- Overview tab ----

function OverviewTab({ tool }: { tool: Tool }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
      <Row label="Name"          value={tool.name} />
      <Row label="Slug"          value={tool.slug} mono />
      <Row label="Status"        value={<StatusBadge status={tool.status} />} />
      <Row label="Affiliate URL" value={
        tool.affiliateUrl
          ? <a href={tool.affiliateUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all">{tool.affiliateUrl}</a>
          : null
      } />
      <Row label="Notes"         value={tool.notes} />
      <Row label="Created"       value={fmt(tool.createdAt)} />
      <Row label="Updated"       value={fmt(tool.updatedAt)} />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex gap-4 px-5 py-3">
      <span className="w-32 shrink-0 text-sm text-slate-500">{label}</span>
      <span className={`text-sm text-slate-900 break-all ${mono ? "font-mono" : ""}`}>
        {value ?? <span className="text-slate-400 italic">—</span>}
      </span>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ---- Placeholder ----

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center">
      <p className="text-sm text-slate-400">{children}</p>
    </div>
  );
}
