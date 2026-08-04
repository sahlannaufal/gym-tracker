"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred || installed) return null;

  return (
    <button
      onClick={async () => {
        await deferred.prompt();
        setDeferred(null);
      }}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-lime-400 px-5 py-3 font-semibold text-gray-950 shadow-lg shadow-lime-400/20 transition-colors hover:bg-lime-300"
    >
      Install Aplikasi
    </button>
  );
}
