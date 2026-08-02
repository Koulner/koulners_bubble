"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, Trash2, Music, Loader2, Play, Pause } from "lucide-react";
import { AmbientSound } from "@/components/hero/SoundscapeMixer";

export default function SoundEditor() {
  const [sounds, setSounds] = useState<AmbientSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [previewTrack, setPreviewTrack] = useState<string | null>(null);

  useEffect(() => {
    fetchSounds();
  }, []);

  const fetchSounds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/sounds");
      if (res.ok) {
        const data = await res.json();
        setSounds(data.sounds || []);
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
          commitMessage: "chore(studio): update sounds content [GitOps]",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: "success", message: "Sounds erfolgreich gespeichert (GitOps)" });
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

  const updateSound = (id: string, field: keyof AmbientSound, value: any) => {
    setSounds(sounds.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSound = () => {
    const newSound: AmbientSound = {
      id: `sound-${Date.now()}`,
      title: "Neuer Sound",
      category: "nature",
      url: ""
    };
    setSounds([...sounds, newSound]);
  };

  const deleteSound = (id: string) => {
    if (confirm("Sound wirklich löschen?")) {
      setSounds(sounds.filter(s => s.id !== id));
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-sage" /></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 text-text-dark font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-serif text-sage-dark flex items-center gap-2">
            <Music className="w-5 h-5 text-sage" /> Ambient Sounds
          </h2>
          <p className="text-sm text-text-muted mt-1">Verwalte die Audio-Tracks für das Soundscape Widget.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={addSound} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 transition">
            <Plus className="w-4 h-4" /> Track
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-sage text-white rounded-lg hover:bg-sage-dark transition shadow-md shadow-sage/30">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </button>
        </div>
      </div>

      {status.type !== "idle" && (
        <div className={`p-4 rounded-lg text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {status.message}
        </div>
      )}

      {/* Hidden Audio Element for Previews */}
      {previewTrack && <audio src={previewTrack} autoPlay onEnded={() => setPreviewTrack(null)} />}

      <div className="flex flex-col gap-6">
        {sounds.map(sound => (
          <div key={sound.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative group">
            
            <button onClick={() => deleteSound(sound.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row gap-6 mt-2">
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Titel</label>
                  <input 
                    type="text" 
                    value={sound.title} 
                    onChange={(e) => updateSound(sound.id, "title", e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Kategorie</label>
                  <select
                    value={sound.category}
                    onChange={(e) => updateSound(sound.id, "category", e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage"
                  >
                    <option value="frequency">Frequenzen</option>
                    <option value="binaural">Binaurale Beats</option>
                    <option value="percussion">Trommeln & Klangschalen</option>
                    <option value="flute">Flöten</option>
                    <option value="voice">Stimmen & Mantren</option>
                    <option value="nature">Naturgeräusche</option>
                    <option value="ambient">Atmosphäre & Rauschen</option>
                  </select>
                </div>
              </div>

              <div className="w-full md:w-2/3 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Audio URL (.mp3)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={sound.url} 
                      onChange={(e) => updateSound(sound.id, "url", e.target.value)}
                      placeholder="https://.../audio.mp3" 
                      className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage text-sm"
                    />
                    <button 
                      onClick={() => setPreviewTrack(previewTrack === sound.url ? null : sound.url)}
                      className="p-2.5 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 flex items-center justify-center transition"
                      title="Preview Audio"
                    >
                      {previewTrack === sound.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {sounds.length === 0 && (
          <div className="text-center py-12 text-text-muted bg-white rounded-2xl border border-gray-100">
            Keine Audio-Tracks gefunden. Füge einen neuen hinzu.
          </div>
        )}
      </div>
    </div>
  );
}
