import { useCallback, useEffect, useState } from "react";
import { createTool, getTools, type Tool } from "./lib/api.js";

export default function App() {
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
        <ToolList tools={tools} status={listStatus} error={listError} />
      </div>
    </main>
  );
}

// ---- Add Tool Form ----

interface AddToolFormProps {
  onCreated: () => void;
}

function AddToolForm({ onCreated }: AddToolFormProps) {
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
            className={input}
          />
        </Field>
        <Field label="Affiliate URL">
          <input
            type="url"
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="https://..."
            className={input}
          />
        </Field>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes…"
            className={input}
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
}

function ToolList({ tools, status, error }: ToolListProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900 mb-3">
        Tools {status === "ok" && tools.length > 0 && (
          <span className="text-slate-400 font-normal">({tools.length})</span>
        )}
      </h2>
      {status === "loading" && <p className="text-sm text-slate-500">Loading…</p>}
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      {status === "ok" && tools.length === 0 && (
        <p className="text-sm text-slate-500">No tools yet. Add one above.</p>
      )}
      {status === "ok" && tools.length > 0 && (
        <ul className="space-y-3">
          {tools.map((tool) => <ToolRow key={tool.id} tool={tool} />)}
        </ul>
      )}
    </section>
  );
}

function ToolRow({ tool }: { tool: Tool }) {
  return (
    <li className="bg-white border border-slate-200 rounded-xl px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-slate-900">{tool.name}</span>
        <StatusBadge status={tool.status} />
      </div>
      <p className="text-xs text-slate-400 mt-0.5">{tool.slug}</p>
      {tool.affiliateUrl && (
        <a
          href={tool.affiliateUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-500 hover:underline mt-1 block truncate"
        >
          {tool.affiliateUrl}
        </a>
      )}
      {tool.notes && (
        <p className="text-sm text-slate-600 mt-2">{tool.notes}</p>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    researched: "bg-blue-50 text-blue-700",
    generated: "bg-violet-50 text-violet-700",
    approved: "bg-green-50 text-green-700",
    archived: "bg-amber-50 text-amber-700",
  };
  const cls = colours[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

// ---- Shared primitives ----

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const input =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
