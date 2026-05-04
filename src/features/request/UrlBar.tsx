import { Send } from "lucide-react";
import { FormEvent, KeyboardEvent } from "react";

import { Button } from "../../components/ui/Button";
import type { HttpMethod } from "../../types/http";
import { MethodPicker } from "./MethodPicker";

interface UrlBarProps {
  method: HttpMethod;
  url: string;
  sending: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onSend: () => void;
}

export function UrlBar({
  method,
  url,
  sending,
  onMethodChange,
  onUrlChange,
  onSend,
}: UrlBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim() === "" || sending) return;
    onSend();
  };

  // Cmd/Ctrl + Enter is the muscle-memory shortcut from terminals — it
  // works inside the URL input even when Send isn't focused.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (url.trim() !== "" && !sending) onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-stretch">
      <MethodPicker value={method} onChange={onMethodChange} />
      <input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="https://api.example.com/v1/users"
        spellCheck={false}
        autoComplete="off"
        className="h-11 min-w-0 flex-1 border-y border-stone-800 bg-stone-900/40 px-3 font-mono text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-fuchsia-500/50"
      />
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={sending || url.trim() === ""}
        icon={<Send size={15} />}
        className="rounded-l-none rounded-r-lg"
      >
        {sending ? "Sending" : "Send"}
      </Button>
    </form>
  );
}
