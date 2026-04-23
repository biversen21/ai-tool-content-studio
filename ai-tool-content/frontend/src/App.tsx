import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "./lib/api.js";

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; data: HealthResponse }
  | { kind: "error"; message: string };

export default function App() {
  const [health, setHealth] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    getHealth()
      .then((data) => setHealth({ kind: "ok", data }))
      .catch((err: unknown) =>
        setHealth({
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        })
      );
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold mb-2">ai-tool-content</h1>
        <p className="text-slate-600 mb-6">
          Scaffold is up. The frontend is talking to the backend at{" "}
          <code className="px-1 py-0.5 bg-slate-100 rounded">/api/health</code>.
        </p>

        <section>
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
            Backend health
          </h2>
          {health.kind === "loading" && (
            <p className="text-slate-500">Checking…</p>
          )}
          {health.kind === "ok" && (
            <pre className="text-sm bg-slate-50 rounded-lg p-4 border border-slate-200 overflow-x-auto">
              {JSON.stringify(health.data, null, 2)}
            </pre>
          )}
          {health.kind === "error" && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium mb-1">Could not reach the backend.</p>
              <p>{health.message}</p>
              <p className="mt-2 text-red-600">
                Is it running on port 4000? Try <code>npm run dev:backend</code>.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
