"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, CircleDashed } from "lucide-react";

export default function BubbleConfigEditor() {
  const [requiredPops, setRequiredPops] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/bubble-config");
      if (res.ok) {
        const data = await res.json();
        if (data.bubbleConfig?.requiredPopsForMode !== undefined) {
          setRequiredPops(data.bubbleConfig.requiredPopsForMode);
        }
      }
    } catch (error) {
      console.error("Failed to fetch bubble config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: "idle" });
    try {
      const res = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: "bubble-config.json",
          rawContent: JSON.stringify({ requiredPopsForMode: requiredPops }, null, 2),
          commitMessage: "chore(studio): update bubble config [GitOps]",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: "success", message: "Bubble Config erfolgreich gespeichert (GitOps)" });
      } else {
        setStatus({ type: "error", message: data.error || "Fehler beim Speichern" });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Netzwerkfehler" });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus({ type: "idle" }), 5000);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-sage" /></div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 text-text-dark font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-sage-dark flex items-center gap-2">
            <CircleDashed className="w-5 h-5 text-sage" /> Bubble Unlock Mode
          </h2>
          <p className="text-sm text-text-muted mt-1">Stelle ein, ab wie vielen geplatzten Bubbles der Bubble-Mode Button erscheint.</p>
        </div>
      </div>

      {status.type !== "idle" && (
        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {status.message}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Benötigte Bubbles</label>
          <input 
            type="number" 
            min={1}
            value={requiredPops} 
            onChange={(e) => setRequiredPops(parseInt(e.target.value) || 1)}
            className="w-full max-w-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage font-mono text-lg"
          />
          <p className="text-xs text-text-muted mt-2">
            Wenn ein Nutzer {requiredPops} {requiredPops === 1 ? 'Bubble platzt' : 'Bubbles platzt'}, schaltet sich das geheime Menü frei.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-sage text-white rounded-lg hover:bg-sage-dark transition shadow-md shadow-sage/30 font-medium">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Konfiguration Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
