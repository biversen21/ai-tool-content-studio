import { useEffect, useState } from "react";
import { getTool, getLatestResearch, runResearch, type Tool, type ResearchRun, type ResearchFact } from "./lib/api.js";
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
            {tab === "research"  && <ResearchTab toolId={tool.id} />}
            {tab === "generated" && <Placeholder>Generated content will appear here once the generation feature is implemented.</Placeholder>}
            {tab === "publish"   && <Placeholder>Publish preview will appear here once the publish feature is implemented.</Placeholder>}
          </>
        )}

      </div>
    </main>
  );
}

// ---- Research tab ----

const CATEGORY_LABELS: Record<string, string> = {
  feature:    "Features",
  pricing:    "Pricing",
  use_case:   "Use Cases",
  audience:   "Target Audience",
  integration:"Integrations",
  competitor: "Competitors & Alternatives",
  claim:      "Claims",
  other:      "Other",
};

const CATEGORY_ORDER = ["feature", "pricing", "use_case", "audience", "competitor", "integration", "claim", "other"];

function ResearchTab({ toolId }: { toolId: string }) {
  const [run, setRun] = useState<ResearchRun | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState("");

  useEffect(() => {
    setLoadStatus("loading");
    getLatestResearch(toolId)
      .then(({ run }) => { setRun(run); setLoadStatus("ok"); })
      .catch((e) => { setLoadError(e instanceof Error ? e.message : "Failed to load"); setLoadStatus("error"); });
  }, [toolId]);

  async function handleRunResearch() {
    setRunning(true);
    setRunError("");
    try {
      const { run } = await runResearch(toolId);
      setRun(run);
    } catch (e) {
      setRunError(e instanceof Error ? e.message : "Research failed");
    } finally {
      setRunning(false);
    }
  }

  if (loadStatus === "loading") return <p className="text-sm text-slate-500">Loading…</p>;
  if (loadStatus === "error")   return <p className="text-sm text-red-600">{loadError}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          {run && (
            <p className="text-xs text-slate-500">
              Last run: {new Date(run.startedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              {" · "}<span className={run.status === "completed" ? "text-green-600" : run.status === "failed" ? "text-red-600" : "text-slate-500"}>{run.status}</span>
              {run.model && <span className="text-slate-400"> · {run.model}</span>}
            </p>
          )}
        </div>
        <button
          onClick={handleRunResearch}
          disabled={running}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {running ? "Researching…" : run ? "Re-run Research" : "Run Research"}
        </button>
      </div>

      {running && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-700">
          Running research — this may take 15–30 seconds…
        </div>
      )}

      {runError && (
        <p className="text-sm text-red-600">{runError}</p>
      )}

      {!run && !running && (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center">
          <p className="text-sm text-slate-400">No research yet. Click "Run Research" to start.</p>
        </div>
      )}

      {run?.status === "failed" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          Last research run failed. Check your OPENAI_API_KEY and try again.
        </div>
      )}

      {run?.facts && run.facts.length > 0 && <FactGroups facts={run.facts} />}
    </div>
  );
}

function FactGroups({ facts }: { facts: ResearchFact[] }) {
  const grouped = new Map<string, ResearchFact[]>();
  for (const cat of CATEGORY_ORDER) grouped.set(cat, []);
  for (const f of facts) {
    const bucket = grouped.get(f.category) ?? grouped.get("other")!;
    bucket.push(f);
  }

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped.get(cat) ?? [];
        if (!items.length) return null;
        return (
          <section key={cat} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <h3 className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
              {CATEGORY_LABELS[cat] ?? cat}
              <span className="ml-2 font-normal text-slate-400">({items.length})</span>
            </h3>
            <ul className="divide-y divide-slate-100">
              {items.map((f) => <FactRow key={f.id} fact={f} />)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function FactRow({ fact }: { fact: ResearchFact }) {
  return (
    <li className="px-5 py-3 flex items-start gap-3">
      <span className="flex-1 text-sm text-slate-800">{fact.content}</span>
      <span className="shrink-0 flex items-center gap-2">
        {fact.sourceUrl && (
          <a href={fact.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
            source
          </a>
        )}
        {fact.confidence != null && (
          <span className={`text-xs font-medium ${confidenceColor(fact.confidence)}`}>
            {Math.round(fact.confidence * 100)}%
          </span>
        )}
      </span>
    </li>
  );
}

function confidenceColor(c: number): string {
  if (c >= 0.8) return "text-green-600";
  if (c >= 0.5) return "text-amber-600";
  return "text-red-500";
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
