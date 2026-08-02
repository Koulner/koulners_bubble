"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, Trash2, Loader2, Music, CheckSquare, Square, Eye, EyeOff } from "lucide-react";
import { AmbientSound, SoundCategory } from "@/components/hero/SoundscapeMixer";

export default function SoundManager() {
  const [sounds, setSounds] = useState<AmbientSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSounds();
  }, []);

  const fetchSounds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/sounds");
      if (res.ok) {
        const data = await res.json();
        // Ensure enabled is true by default for missing properties
        const fetchedSounds = data.sounds?.map((s: any) => ({ ...s, enabled: s.enabled !== false })) || [];
        setSounds(fetchedSounds);
      }
    } catch (error) {
      console.error("Failed to fetch sounds:", error);
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
          slug: "sounds.json",
          rawContent: JSON.stringify(sounds, null, 2),
          commitMessage: "chore(studio): update sounds content and status via bulk manager [GitOps]",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: "success", message: "Sounds erfolgreich gespeichert! (Live Update triggert)" });
        setSelectedIds(new Set());
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

  const toggleSelectAll = () => {
    if (selectedIds.size === sounds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sounds.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkEnable = (enabled: boolean) => {
    setSounds(sounds.map(s => selectedIds.has(s.id) ? { ...s, enabled } : s));
  };

  const handleBulkDelete = () => {
    if (confirm(`Wirklich ${selectedIds.size} Sounds löschen?`)) {
      setSounds(sounds.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    }
  };

  const toggleSingleStatus = (id: string) => {
    setSounds(sounds.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const updateSound = (id: string, field: keyof AmbientSound, value: any) => {
    setSounds(sounds.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSound = () => {
    const newSound: AmbientSound = {
      id: `sound-${Date.now()}`,
      title: "Neuer Sound",
      category: "nature",
      url: "",
      enabled: true,
    };
    setSounds([newSound, ...sounds]);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-sage" /></div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 text-text-dark font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-sage-dark flex items-center gap-2">
            <Music className="w-5 h-5 text-sage" /> Sound Manager
          </h2>
          <p className="text-sm text-text-muted mt-1">Verwalte die Audio-Tracks und schalte sie für Besucher frei oder unsichtbar.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={addSound} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 transition">
            <Plus className="w-4 h-4" /> Neuer Track
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-sage text-white rounded-lg hover:bg-sage-dark transition shadow-md shadow-sage/30">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern & Live stellen
          </button>
        </div>
      </div>

      {status.type !== "idle" && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {status.message}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-sage/10 border border-sage/20 p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-sage-dark">
            {selectedIds.size} Sound{selectedIds.size > 1 ? "s" : ""} ausgewählt
          </span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkEnable(true)} className="px-3 py-1.5 text-xs font-medium bg-white text-sage-dark rounded-lg border border-sage/30 hover:bg-sage/5 transition flex items-center gap-1">
              <Eye className="w-3 h-3" /> Aktivieren
            </button>
            <button onClick={() => handleBulkEnable(false)} className="px-3 py-1.5 text-xs font-medium bg-white text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Deaktivieren
            </button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Löschen
            </button>
          </div>
        </div>
      )}

      {/* Table List View */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-sage transition">
                    {selectedIds.size === sounds.length && sounds.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-sage" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titel</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategorie</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sounds.map((sound) => (
                <tr key={sound.id} className={`hover:bg-gray-50/50 transition-colors ${selectedIds.has(sound.id) ? "bg-sage/5" : ""}`}>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleSelect(sound.id)} className="text-gray-400 hover:text-sage transition">
                      {selectedIds.has(sound.id) ? (
                        <CheckSquare className="w-5 h-5 text-sage" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <input 
                      type="text" 
                      value={sound.title} 
                      onChange={(e) => updateSound(sound.id, "title", e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-sage focus:outline-none text-sm font-medium text-text-dark"
                    />
                  </td>
                  <td className="p-4">
                    <select
                      value={sound.category}
                      onChange={(e) => updateSound(sound.id, "category", e.target.value)}
                      className="w-full bg-transparent border-b border-transparent focus:border-sage focus:outline-none text-sm text-text-muted"
                    >
                      <option value="frequency">Frequenzen</option>
                      <option value="binaural">Binaurale Beats</option>
                      <option value="percussion">Trommeln & Klangschalen</option>
                      <option value="flute">Flöten</option>
                      <option value="voice">Stimmen & Mantren</option>
                      <option value="nature">Naturgeräusche</option>
                      <option value="ambient">Atmosphäre & Rauschen</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input 
                      type="text" 
                      value={sound.url} 
                      onChange={(e) => updateSound(sound.id, "url", e.target.value)}
                      placeholder="http://..."
                      className="w-full bg-transparent border-b border-transparent focus:border-sage focus:outline-none text-xs text-text-muted font-mono"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleSingleStatus(sound.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                        sound.enabled ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {sound.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {sound.enabled ? "Aktiv" : "Inaktiv"}
                    </button>
                  </td>
                </tr>
              ))}
              {sounds.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted text-sm">
                    Keine Sounds gefunden. Klicke auf "Neuer Track".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
