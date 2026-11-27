import { createContext, useContext, useMemo, useState } from "react";
import { z } from "zod";
import { env } from "../config/env";
import { readJson, writeJson } from "../services/storage";

export const settingsSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(40, "Workspace name must be 40 characters or fewer")
    .regex(/^[\p{L}\p{N}][\p{L}\p{N}\s&.'-]*$/u, "Use letters, numbers, spaces, & . ' - only"),
  compact: z.boolean(),
});

const KEY = "pw_settings";
const defaults = { workspaceName: env.appName, compact: false };
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const parsed = settingsSchema.safeParse(readJson(KEY, defaults)); // stored data is untrusted too
    return parsed.success ? parsed.data : defaults;
  });
  const save = (next) => {
    setSettings(next);
    writeJson(KEY, next);
  };
  const value = useMemo(() => ({ settings, save, defaults }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
};
