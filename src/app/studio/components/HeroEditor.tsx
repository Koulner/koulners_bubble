"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Save, Trash2, Image as ImageIcon, Upload, Loader2, Sparkles } from "lucide-react";

export interface HeroEntry {
  id: string;
  imageSrc: string;
  quote: string;
  author: string;
  altText: string;
}

export default function HeroEditor() {
  const [entries, setEntries] = useState<HeroEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/hero-content");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch hero content:", error);
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
          slug: "hero-content.json",
          rawContent: JSON.stringify(entries, null, 2),
          commitMessage: "chore(studio): update hero content [GitOps]",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: "success", message: "Hero Content erfolgreich gespeichert (GitOps)" });
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

  const updateEntry = (id: string, field: keyof HeroEntry, value: string) => {
    setEntries(entries.map(e => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addEntry = () => {
    const newEntry: HeroEntry = {
      id: `hero-${Date.now()}`,
      quote: "Neues Zitat hier...",
      author: "Autor",
      imageSrc: "",
      altText: "Beschreibung",
    };
    setEntries([newEntry, ...entries]);
  };

  const deleteEntry = (id: string) => {
    if (confirm("Eintrag wirklich löschen?")) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const triggerUpload = (id: string) => {
    setActiveUploadId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadId) return;

    setUploadingImage(activeUploadId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        updateEntry(activeUploadId, "imageSrc", data.url);
      } else {
        alert(data.error || "Upload fehlgeschlagen");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Netzwerkfehler beim Upload");
    } finally {
      setUploadingImage(null);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            <Sparkles className="w-5 h-5 text-sage" /> Dynamic Hero Settings
          </h2>
          <p className="text-sm text-text-muted mt-1">Verwalte die Zitate und Bilder der Startseite.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={addEntry} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 transition">
            <Plus className="w-4 h-4" /> Eintrag
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

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      <div className="flex flex-col gap-6">
        {entries.map(entry => (
          <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 relative group">
            
            <button onClick={() => deleteEntry(entry.id)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Image Preview & Upload */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              <div className="aspect-video bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative group/img">
                {entry.imageSrc ? (
                  <img src={entry.imageSrc} alt={entry.altText} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">Kein Bild</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <button 
                    onClick={() => triggerUpload(entry.id)}
                    disabled={uploadingImage === entry.id}
                    className="flex items-center gap-2 bg-white text-text-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                  >
                    {uploadingImage === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Bild hochladen
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                value={entry.imageSrc} 
                onChange={(e) => updateEntry(entry.id, "imageSrc", e.target.value)}
                placeholder="Bild-URL (S3 oder Unsplash)" 
                className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>

            {/* Text Content */}
            <div className="w-full md:w-2/3 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Zitat</label>
                <textarea 
                  value={entry.quote}
                  onChange={(e) => updateEntry(entry.id, "quote", e.target.value)}
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage/50 resize-none font-serif text-lg"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Autor / Quelle</label>
                  <input 
                    type="text" 
                    value={entry.author} 
                    onChange={(e) => updateEntry(entry.id, "author", e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-muted mb-1 uppercase tracking-wider">Alt-Text (SEO)</label>
                  <input 
                    type="text" 
                    value={entry.altText} 
                    onChange={(e) => updateEntry(entry.id, "altText", e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-12 text-text-muted bg-white rounded-2xl border border-gray-100">
            Keine Einträge gefunden. Füge einen neuen Hero-Eintrag hinzu.
          </div>
        )}
      </div>
    </div>
  );
}
