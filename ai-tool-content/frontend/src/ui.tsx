const STATUS_COLOURS: Record<string, string> = {
  draft:      "bg-slate-100 text-slate-600",
  researched: "bg-blue-50 text-blue-700",
  generated:  "bg-violet-50 text-violet-700",
  approved:   "bg-green-50 text-green-700",
  archived:   "bg-amber-50 text-amber-700",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLOURS[status] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {status}
    </span>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
