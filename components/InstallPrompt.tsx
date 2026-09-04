"use client";

import { useEffect, useState } from "react";
import { setUserProperties, trackEvent } from "@/lib/analytics";

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
      trackEvent("PWA Install Prompt Shown", {
        platform: navigator.platform || "web",
      });
    };
    const onInstalled = () => {
      setInstalled(true);
      trackEvent("PWA Installed", {
        platform: navigator.platform || "web",
        installation_method: "browser_prompt",
      });
      setUserProperties({
        pwa_installed: true,
        pwa_last_installed_at: new Date().toISOString(),
      });
    };

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
        trackEvent("PWA Install Clicked", {
          platform: navigator.platform || "web",
        });
        await deferred.prompt();
        const choice = await deferred.userChoice;
        trackEvent(
          choice.outcome === "accepted" ? "PWA Install Accepted" : "PWA Install Dismissed",
          {
            platform: navigator.platform || "web",
          },
        );
        setDeferred(null);
      }}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-lime-400 px-5 py-3 font-semibold text-gray-950 shadow-lg shadow-lime-400/20 transition-colors hover:bg-lime-300"
    >
      Install Aplikasi
    </button>
  );
}
