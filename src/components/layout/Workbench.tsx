import { ReactNode } from "react";

interface WorkbenchProps {
  request: ReactNode;
  response: ReactNode;
}

/**
 * Side-by-side request/response layout. We deliberately skip the
 * top/bottom split that most API tools use — composing on the left and
 * reading on the right reads more like a doc + preview than a form.
 */
export function Workbench({ request, response }: WorkbenchProps) {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-w-0 flex-1 overflow-y-auto border-r border-stone-800/80">
        {request}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">{response}</div>
    </div>
  );
}
