import { Suspense } from "react";
import ResultsView from "@/components/ResultsView";

export default function ScanPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="p-10 text-center text-white/40">…</div>}>
        <ResultsView />
      </Suspense>
    </main>
  );
}
