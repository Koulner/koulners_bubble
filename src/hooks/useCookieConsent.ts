import { useState, useEffect } from "react";

export type ConsentStatus = "pending" | "accepted_all" | "essential_only";

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>("pending");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const stored = localStorage.getItem("cookie_consent");
    if (stored === "accepted_all" || stored === "essential_only") {
      setConsent(stored as ConsentStatus);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie_consent", "accepted_all");
    setConsent("accepted_all");
    window.dispatchEvent(new Event("cookie_consent_changed"));
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie_consent", "essential_only");
    setConsent("essential_only");
    window.dispatchEvent(new Event("cookie_consent_changed"));
  };

  return { consent, acceptAll, acceptEssential, isMounted };
}
