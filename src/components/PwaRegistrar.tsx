"use client";

import { useEffect, useState } from "react";

export function triggerPwaInstall() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
  }
}

export function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [guideModal, setGuideModal] = useState<"ios" | "browser" | null>(null);

  useEffect(() => {
    // Check if user dismissed previously in this session
    try {
      if (sessionStorage.getItem("pwa_dismissed") === "true") {
        setIsDismissed(true);
      }
    } catch {
      // Ignore
    }

    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // Check if running in standalone PWA mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }
    }

    // Listen for Chromium / Android / Desktop PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    // Listen to manual install triggers from buttons across the app
    const manualTriggerHandler = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(({ outcome }: any) => {
          if (outcome === "accepted") {
            setIsInstalled(true);
          }
          setDeferredPrompt(null);
          setIsInstallable(false);
        });
      } else {
        const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        if (isIos) {
          setGuideModal("ios");
        } else {
          setGuideModal("browser");
        }
      }
    };

    window.addEventListener("trigger-pwa-install", manualTriggerHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("trigger-pwa-install", manualTriggerHandler);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("pwa_dismissed", "true");
    } catch {
      // Ignore
    }
  };

  return (
    <>
      {/* Floating Prompt Banner (Chromium / Android) */}
      {!isInstalled && !isDismissed && isInstallable && (
        <aside className="pwa-install-banner" aria-label="Install QueueLess App">
          <div className="pwa-install-info">
            <span className="pwa-install-badge">Native App Ready</span>
            <strong>Install QueueLess AI on your Device</strong>
            <small>Fast, offline-ready errand guide for Phone &amp; PC</small>
          </div>
          <div className="pwa-actions-row">
            <button type="button" onClick={handleInstallClick} className="pwa-install-btn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Install App</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="pwa-dismiss-btn"
              aria-label="Dismiss install banner"
              title="Dismiss"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </aside>
      )}

      {/* Guide Modal when install button is clicked without native prompt */}
      {guideModal && (
        <div className="pwa-guide-overlay" onClick={() => setGuideModal(null)}>
          <div className="pwa-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-guide-head">
              <strong>Install QueueLess AI</strong>
              <button
                type="button"
                className="guide-close-btn"
                onClick={() => setGuideModal(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {guideModal === "ios" ? (
              <div className="pwa-guide-body">
                <p>To install on iPhone or iPad:</p>
                <ol>
                  <li>Tap the <strong>Share</strong> icon (the square with an arrow pointing up) at the bottom of Safari.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong> in the top-right corner.</li>
                </ol>
              </div>
            ) : (
              <div className="pwa-guide-body">
                <p>To install on your PC / Mac / Chrome:</p>
                <ol>
                  <li>Look at your browser&apos;s address bar at the top right.</li>
                  <li>Click the <strong>Install QueueLess AI</strong> icon (computer with down arrow).</li>
                  <li>Click <strong>Install</strong> to launch QueueLess as a native desktop app.</li>
                </ol>
              </div>
            )}
            <button
              type="button"
              className="guide-action-btn"
              onClick={() => setGuideModal(null)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}