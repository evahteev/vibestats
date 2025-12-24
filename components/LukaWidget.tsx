"use client";

import { useEffect, useRef } from "react";

export function LukaWidget() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const initialized = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="luka_embed.js"]');
    if (existingScript) return;

    initialized.current = true;

    // Set widget config before loading script
    (window as any).LukaWidgetConfig = {
      pageContext: {
        url: typeof window !== "undefined" ? window.location.href : "",
        title: typeof window !== "undefined" ? document.title : "",
      }
    };

    // Create and inject script
    const script = document.createElement("script");
    script.src = "https://chat-evgeny-ai.apps.gurunetwork.ai/luka_embed.js";
    script.setAttribute("data-mode", "copilot");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-sub-agent", "cursor_leaderboard");
    script.setAttribute("data-api-url", "https://chat-evgeny-ai.apps.gurunetwork.ai");
    script.setAttribute("data-default-open", "false");

    document.body.appendChild(script);
    scriptRef.current = script;

    // Auto-open widget after 2 seconds
    const autoOpenTimer = setTimeout(() => {
      const widget = (window as any).LukaWidget;
      if (widget?.open) {
        widget.open();
        sidebarOpen = true;
        document.body.classList.add('luka-sidebar-open');
      }
    }, 2000);

    // Simple toggle approach
    let sidebarOpen = false;

    const handleToggleClick = () => {
      sidebarOpen = !sidebarOpen;
      document.body.classList.toggle('luka-sidebar-open', sidebarOpen);
    };

    // Find and attach listener to toggle button
    const attachToggleListener = () => {
      // Look for the Luka toggle button - any clickable element on the right edge
      document.querySelectorAll('button, [role="button"], div').forEach((btn) => {
        if (btn.hasAttribute('data-luka-listener')) return;

        const rect = btn.getBoundingClientRect();
        // Toggle is typically a small fixed button on the right side
        if (rect.right > window.innerWidth - 80 && rect.width < 80 && rect.height < 80 && rect.width > 20) {
          btn.setAttribute('data-luka-listener', 'true');
          btn.addEventListener('click', handleToggleClick);
        }
      });
    };

    const toggleInterval = setInterval(attachToggleListener, 300);
    observerRef.current = { disconnect: () => clearInterval(toggleInterval) } as MutationObserver;

    return () => {
      clearTimeout(autoOpenTimer);
      observerRef.current?.disconnect();
      document.body.classList.remove('luka-sidebar-open');
      // Cleanup on unmount
      const widget = (window as any).LukaWidget;
      if (widget?.destroy) {
        widget.destroy();
      }
      scriptRef.current?.remove();
      delete (window as any).LukaWidgetConfig;
      initialized.current = false;
    };
  }, []);

  return null;
}
