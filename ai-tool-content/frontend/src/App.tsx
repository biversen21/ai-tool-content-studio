import { useCallback, useEffect, useState } from "react";
import { createTool, getTools, type Tool } from "./lib/api.js";
import { Field, inputCls, StatusBadge } from "./ui.js";
import { ToolDetail } from "./ToolDetail.js";

type View = { page: "dashboard" } | { page: "detail"; toolId: string };

export default function App() {
  const [view, setView] = useState<View>({ page: "dashboard" });

  if (view.page === "detail") {
    return (
      <ToolDetail
        toolId={view.toolId}
        onBack={() => setView({ page: "dashboard" })}
      />
    );
  }

  return <Dashboard onSelect={(id) => setView({ page: "detail", toolId: id })} />;
}

// ---- Dashboard ----

function Dashboard({ onSelect }: { onSelect: (id: string) => void }) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [listStatus, setListStatus] = useState<"loading" | "ok" | "error">("loading");
  const [listError, setListError] = useState("");

  const loadTools = useCallback(async () => {
    setListStatus("loading");
    try {
      const { tools } = await getTools();
      setTools(tools);
      setListStatus("ok");
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load tools");
      setListStatus("error");
    }
  }, []);

  useEffect(() => { loadTools(); }, [loadTools]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-slate-900">AI Tool Content Studio</h1>
        <AddToolForm onCreated={loadTools} />
        <ToolList tools={tools} status={listStatus} error={listError} onSelect={onSelect} />
      </div>
    </main>
  );
}

// ---- Add Tool Form ----

function AddToolForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitStatus("submitting");
    setSubmitError("");
    try {
      await createTool({
        name,
        affiliateUrl: affiliateUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setName("");
      setAffiliateUrl("");
      setNotes("");
      setSubmitStatus("idle");
      onCreated();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create tool");
      setSubmitStatus("error");
    }
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">Add Tool</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" required>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Notion AI"
            className={inputCls}
          />
        </Field>
        <Field label="Affiliate URL">
          <input
            type="url"
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes…"
            className={inputCls}
          />
        </Field>
        {submitStatus === "error" && (
          <p className="text-sm text-red-600">{submitError}</p>
        )}
        <button
          type="submit"
          disabled={submitStatus === "submitting"}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {submitStatus === "submitting" ? "Adding…" : "Add Tool"}
        </button>
      </form>
    </section>
  );
}

// ---- Tool List ----

interface ToolListProps {
  tools: Tool[];
  status: "loading" | "ok" | "error";
  error: string;
  onSelect: (id: string) => void;
}

function ToolList({ tools, status, error, onSelect }: ToolListProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900 mb-3">
        Tools{status === "ok" && tools.length > 0 && (
          <span className="text-slate-400 font-normal"> ({tools.length})</span>
        )}
      </h2>
      {status === "loading" && <p className="text-sm text-slate-500">Loading…</p>}
      {status === "error"   && <p className="text-sm text-red-600">{error}</p>}
      {status === "ok" && tools.length === 0 && (
        <p className="text-sm text-slate-500">No tools yet. Add one above.</p>
      )}
      {status === "ok" && tools.length > 0 && (
        <ul className="space-y-3">
          {tools.map((tool) => (
            <ToolRow key={tool.id} tool={tool} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ToolRow({ tool, onSelect }: { tool: Tool; onSelect: (id: string) => void }) {
  return (
    <li>
      <button
        onClick={() => onSelect(tool.id)}
        className="w-full text-left bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-slate-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-medium text-slate-900">{tool.name}</span>
          <StatusBadge status={tool.status} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{tool.slug}</p>
        {tool.affiliateUrl && (
          <p className="text-xs text-blue-500 mt-1 truncate">{tool.affiliateUrl}</p>
        )}
        {tool.notes && (
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{tool.notes}</p>
        )}
      </button>
    </li>
  );
}
