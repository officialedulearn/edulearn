import { Suspense } from "react";
import TestPageClient from "./TestPageCient";

export default function TestPage() {
  return (
    <Suspense fallback={<div>Loading test page...</div>}>
      <TestPageClient />
    </Suspense>
  );
}
