import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

import { Input } from "../../components/ui/Input";
import type { AuthConfig, AuthMode } from "../../types/http";

interface AuthEditorProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}

const MODES: { value: AuthMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bearer", label: "Bearer Token" },
  { value: "basic", label: "Basic Auth" },
];

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (patch: Partial<AuthConfig>) => onChange({ ...auth, ...patch });

  return (
    <div className="flex flex-col gap-3">
      {/* Mode selector */}
      <div className="flex rounded-md border border-stone-800 bg-stone-950/60 p-0.5 self-start">
        {MODES.map((m) => {
          const active = m.value === auth.mode;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => update({ mode: m.value })}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-stone-800 text-fuchsia-300"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {auth.mode === "none" && (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-stone-800 px-3 py-4 text-xs text-stone-500">
          <Lock size={13} />
          No authentication. Set bearer token or basic credentials to have the
          Authorization header added automatically.
        </div>
      )}

      {auth.mode === "bearer" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Token
          </label>
          <div className="relative">
            <Input
              type={showToken ? "text" : "password"}
              value={auth.bearerToken}
              onChange={(e) => update({ bearerToken: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
              className="pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
              aria-label={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="text-[10px] text-stone-500">
            Sends: <span className="font-mono text-stone-400">Authorization: Bearer &lt;token&gt;</span>
          </div>
        </div>
      )}

      {auth.mode === "basic" && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Username
            </label>
            <Input
              value={auth.basicUser}
              onChange={(e) => update({ basicUser: e.target.value })}
              placeholder="username"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={auth.basicPassword}
                onChange={(e) => update({ basicPassword: e.target.value })}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="text-[10px] text-stone-500">
            Sends: <span className="font-mono text-stone-400">Authorization: Basic &lt;base64&gt;</span>
          </div>
        </div>
      )}
    </div>
  );
}
