import { useEffect, useState } from "react";
import {
  getTool, getLatestResearch, runResearch, getAssets,
  generateToolPage, generateCategoryPage, generateComparisonPage, generateAll,
  updateAsset, approveAsset, publishPreview, exportJson, exportMarkdown, getPayloads,
  type Tool, type ResearchRun, type ResearchFact, type GeneratedAsset,
  type PreviewResult, type PublishPayload,
} from "./lib/api.js";
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
            {tab === "generated" && <GeneratedContentTab toolId={tool.id} />}
            {tab === "publish"   && <PublishPreviewTab toolId={tool.id} />}
          </>
        )}

      </div>
    </main>
  );
}

// ---- Generated Content tab ----

const ASSET_TYPE_LABELS: Record<string, string> = {
  tool_page:       "Tool Page",
  category_page:   "Category Page",
  comparison_page: "Comparison Page",
};

type GenAction = "tool-page" | "category-page" | "comparison-page" | "all";

function GeneratedContentTab({ toolId }: { toolId: string }) {
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [generating, setGenerating] = useState<GenAction | null>(null);
  const [genError, setGenError] = useState("");

  const load = () => {
    setLoadStatus("loading");
    getAssets(toolId)
      .then(({ assets }) => { setAssets(assets); setLoadStatus("ok"); })
      .catch((e) => { setLoadError(e instanceof Error ? e.message : "Failed to load"); setLoadStatus("error"); });
  };

  useEffect(load, [toolId]);

  async function handleGenerate(action: GenAction) {
    setGenerating(action);
    setGenError("");
    try {
      if (action === "all") {
        await generateAll(toolId);
      } else if (action === "tool-page") {
        await generateToolPage(toolId);
      } else if (action === "category-page") {
        await generateCategoryPage(toolId);
      } else {
        await generateComparisonPage(toolId);
      }
      load();
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  const busy = generating !== null;

  if (loadStatus === "loading") return <p className="text-sm text-slate-500">Loading…</p>;
  if (loadStatus === "error")   return <p className="text-sm text-red-600">{loadError}</p>;

  return (
    <div className="space-y-5">
      {/* Action buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Generate</p>
        <div className="flex flex-wrap gap-2">
          {(["tool-page", "category-page", "comparison-page"] as GenAction[]).map((action) => (
            <button
              key={action}
              onClick={() => handleGenerate(action)}
              disabled={busy}
              className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {generating === action ? "Generating…" : `Generate ${ASSET_TYPE_LABELS[action.replace("-", "_")]}`}
            </button>
          ))}
          <button
            onClick={() => handleGenerate("all")}
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            {generating === "all" ? "Generating all…" : "Generate All"}
          </button>
        </div>
        {busy && (
          <p className="text-xs text-blue-600">Generating — this may take 20–40 seconds per asset…</p>
        )}
        {genError && <p className="text-sm text-red-600">{genError}</p>}
      </div>

      {/* Asset list */}
      {assets.length === 0 && !busy && (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center">
          <p className="text-sm text-slate-400">No assets yet. Click a Generate button above.</p>
        </div>
      )}
      {assets.length > 0 && (
        <div className="space-y-3">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} onUpdate={load} />
          ))}
        </div>
      )}
    </div>
  );
}

type PreviewMode = "markdown" | "json";

interface AssetCardProps {
  asset: GeneratedAsset;
  onUpdate: () => void;
}

function AssetCard({ asset, onUpdate }: AssetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<PreviewMode>("markdown");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(asset.title);
  const [editMarkdown, setEditMarkdown] = useState(asset.contentMarkdown ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState("");
  const [exporting, setExporting] = useState<"json" | "markdown" | null>(null);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");

  const parsedJson = (() => {
    try { return JSON.parse(asset.contentJson) as Record<string, unknown>; }
    catch { return null; }
  })();

  function startEdit() {
    setEditTitle(asset.title);
    setEditMarkdown(asset.contentMarkdown ?? "");
    setSaveError("");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    try {
      await updateAsset(asset.id, { title: editTitle, contentMarkdown: editMarkdown });
      setEditing(false);
      onUpdate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    setApproveError("");
    try {
      await approveAsset(asset.id);
      onUpdate();
    } catch (e) {
      setApproveError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setApproving(false);
    }
  }

  async function handleExport(format: "json" | "markdown") {
    setExporting(format);
    setExportError("");
    setExportResult(null);
    try {
      const fn = format === "json" ? exportJson : exportMarkdown;
      const { payload } = await fn(asset.id);
      setExportResult(payload.filePath);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <div className="px-5 py-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                {ASSET_TYPE_LABELS[asset.type] ?? asset.type}
              </span>
              <span className="font-medium text-slate-900 truncate">{asset.title}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={asset.status} />
              <span className="text-slate-400 text-sm">{expanded ? "▲" : "▼"}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{asset.slug}</p>
        </button>

        {/* Action buttons row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {!editing && (
            <button
              onClick={startEdit}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              Edit
            </button>
          )}
          {asset.status !== "approved" && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 disabled:opacity-50 transition-colors"
            >
              {approving ? "Approving…" : "Approve"}
            </button>
          )}
          <button
            onClick={() => handleExport("json")}
            disabled={exporting !== null}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
          >
            {exporting === "json" ? "Exporting…" : "Export JSON"}
          </button>
          <button
            onClick={() => handleExport("markdown")}
            disabled={exporting !== null}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
          >
            {exporting === "markdown" ? "Exporting…" : "Export MD"}
          </button>
        </div>

        {approveError && <p className="text-xs text-red-600 mt-2">{approveError}</p>}
        {exportError  && <p className="text-xs text-red-600 mt-2">{exportError}</p>}
        {exportResult && (
          <p className="text-xs text-green-700 mt-2 font-mono">
            Exported → {exportResult}
          </p>
        )}
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Markdown</label>
            <textarea
              value={editMarkdown}
              onChange={(e) => setEditMarkdown(e.target.value)}
              rows={12}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded preview */}
      {expanded && !editing && (
        <div className="border-t border-slate-100">
          {/* Mode toggle */}
          <div className="flex gap-1 px-5 pt-3">
            {(["markdown", "json"] as PreviewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  mode === m
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {m === "markdown" ? "Markdown" : "JSON"}
              </button>
            ))}
          </div>

          {mode === "markdown" && (
            <pre className="px-5 py-4 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto">
              {asset.contentMarkdown ?? "(no markdown)"}
            </pre>
          )}
          {mode === "json" && parsedJson && (
            <pre className="px-5 py-4 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto">
              {JSON.stringify(parsedJson, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Publish Preview tab ----

function PublishPreviewTab({ toolId }: { toolId: string }) {
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setLoadStatus("loading");
    getAssets(toolId)
      .then(({ assets }) => { setAssets(assets); setLoadStatus("ok"); })
      .catch((e) => { setLoadError(e instanceof Error ? e.message : "Failed to load"); setLoadStatus("error"); });
  }, [toolId]);

  if (loadStatus === "loading") return <p className="text-sm text-slate-500">Loading…</p>;
  if (loadStatus === "error")   return <p className="text-sm text-red-600">{loadError}</p>;

  if (assets.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-10 text-center">
        <p className="text-sm text-slate-400">No assets yet. Generate content first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assets.map((asset) => <PublishAssetCard key={asset.id} asset={asset} />)}
    </div>
  );
}

function PublishAssetCard({ asset }: { asset: GeneratedAsset }) {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewMode, setPreviewMode] = useState<"json" | "markdown">("markdown");
  const [payloads, setPayloads] = useState<PublishPayload[]>([]);
  const [payloadsLoaded, setPayloadsLoaded] = useState(false);

  async function handlePreview() {
    setPreviewing(true);
    setPreviewError("");
    try {
      const result = await publishPreview(asset.id);
      setPreview(result);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  }

  async function loadPayloads() {
    try {
      const { payloads } = await getPayloads(asset.id);
      setPayloads(payloads);
      setPayloadsLoaded(true);
    } catch { /* non-critical */ }
  }

  useEffect(() => { void loadPayloads(); }, [asset.id]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
              {ASSET_TYPE_LABELS[asset.type] ?? asset.type}
            </span>
            <StatusBadge status={asset.status} />
          </div>
          <p className="font-medium text-slate-900 truncate">{asset.title}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{asset.slug}</p>
        </div>
        <button
          onClick={handlePreview}
          disabled={previewing}
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"
        >
          {previewing ? "Loading…" : preview ? "Refresh Preview" : "Preview"}
        </button>
      </div>

      {previewError && <p className="text-xs text-red-600 px-5 pb-3">{previewError}</p>}

      {/* Preview pane */}
      {preview && (
        <div className="border-t border-slate-100">
          <div className="flex gap-1 px-5 pt-3 pb-2">
            {(["markdown", "json"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPreviewMode(m)}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  previewMode === m
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {m === "markdown" ? "Markdown" : "JSON"}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400 self-center">
              {previewMode === "markdown" ? preview.markdown.filename : preview.json.filename}
            </span>
          </div>
          <pre className="px-5 py-3 text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto border-t border-slate-50">
            {previewMode === "markdown" ? preview.markdown.body : preview.json.body}
          </pre>
        </div>
      )}

      {/* Export history */}
      {payloadsLoaded && payloads.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs font-medium text-slate-500 mb-2">Exports</p>
          <ul className="space-y-1">
            {payloads.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{p.format}</span>
                <span className="font-mono text-slate-500 truncate">{p.filePath}</span>
                <StatusBadge status={p.status} />
                <span className="shrink-0 text-slate-400 ml-auto">
                  {new Date(p.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
