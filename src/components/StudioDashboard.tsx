"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Save,
  GitCommit,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Eye,
  Code,
  RefreshCw,
  AlertCircle,
  Wand2,
  Archive,
  Trash2,
  CheckSquare,
  Square,
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  Image as ImageIcon,
  Video,
  Layout,
  Table as TableIcon,
  Tag,
  Upload,
  ListTree,
} from "lucide-react";
import { signOut } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx/MDXComponents";

interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  category: string[];
  excerpt: string;
  draft?: boolean;
  archived?: boolean;
}

interface StudioDashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function StudioDashboard({ user }: StudioDashboardProps) {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"drafts" | "published" | "archived" | "categories">("published");

  // Kategorien Management State
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [newCatInput, setNewCatInput] = useState<string>("");
  const [catSaveStatus, setCatSaveStatus] = useState<{ type: "idle" | "saving" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  // Bulk Actions Selection State
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  // Editor State
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string>("");
  const [editorLoading, setEditorLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "idle" | "saving" | "success" | "error"; message?: string }>({
    type: "idle",
  });

  // Frontmatter Felder (Titel & Kategorien)
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaCategories, setMetaCategories] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hilfsfunktion zum Einfügen von Snippets an der Caret-Position (Cursor-Logik)
  const insertSnippet = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = rawContent.substring(start, end);
    const textToInsert = selectedText || defaultText;
    const replacement = `${prefix}${textToInsert}${suffix}`;

    const newContent = rawContent.substring(0, start) + replacement + rawContent.substring(end);
    setRawContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + textToInsert.length + suffix.length;
      textarea.setSelectionRange(
        selectedText ? start + prefix.length : newCursorPos,
        selectedText ? start + prefix.length + textToInsert.length : newCursorPos
      );
    }, 0);
  };

  // S3-konforme Bildupload & Einfüge-Logik
  const uploadAndInsertImage = async (file: File) => {
    setUploadingImage(true);
    setSaveStatus({ type: "saving", message: `Lade ${file.name} auf S3 hoch...` });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const publicUrl = data.url;
        const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        insertSnippet(`\n<CustomImage alt="${altText}" src="${publicUrl}" />\n`);
        setSaveStatus({ type: "success", message: "Bild erfolgreich über S3 hochgeladen und eingefügt!" });
      } else {
        setSaveStatus({ type: "error", message: data.error || "Fehler beim Upload des Bildes." });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err?.message || "Netzwerkfehler beim Bildupload." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setSaveStatus({ type: "error", message: "Bitte nur Bilder per Drag & Drop hochladen (.png, .jpg, .webp)." });
      return;
    }

    await uploadAndInsertImage(file);
  };

  // Co-Pilot State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Artikel aus der API laden
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/studio/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.posts || []);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Artikel:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/studio/categories");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          setAvailableCategories(data.categories);
        }
      }
    } catch (err) {
      console.error("Fehler beim Laden der Kategorien:", err);
    }
  };

  const saveCategoriesToBackend = async (updated: string[]) => {
    setCatSaveStatus({ type: "saving", message: "Speichere Kategorien via GitOps..." });
    try {
      const res = await fetch("/api/studio/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updated }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAvailableCategories(data.categories);
        setCatSaveStatus({
          type: "success",
          message: `${data.message} ${data.gitOps ? "(via GitOps gepusht)" : "(lokal synchronisiert)"}`,
        });
      } else {
        setCatSaveStatus({ type: "error", message: data.error || "Fehler beim Speichern der Kategorien." });
      }
    } catch (err: any) {
      setCatSaveStatus({ type: "error", message: err?.message || "Netzwerkfehler beim Speichern." });
    }
  };

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    const updated = Array.from(new Set([...availableCategories, newCatInput.trim()]));
    setNewCatInput("");
    saveCategoriesToBackend(updated);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (!confirm(`Möchtest du die Kategorie "${catToDelete}" wirklich löschen?`)) return;
    const updated = availableCategories.filter((c) => c !== catToDelete);
    saveCategoriesToBackend(updated);
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  // Artikel zum Bearbeiten öffnen
  const openEditor = async (slug: string) => {
    setEditingSlug(slug);
    setEditorLoading(true);
    setSaveStatus({ type: "idle" });
    try {
      const res = await fetch(`/api/studio/articles?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        const content = data.post.rawContent || "";
        setRawContent(content);
        setMetaTitle(data.post.title || "");
        const cats = Array.isArray(data.post.category)
          ? data.post.category.join(", ")
          : String(data.post.category || "");
        setMetaCategories(cats);
      }
    } catch (err) {
      console.error("Fehler beim Laden des Artikels:", err);
    } finally {
      setEditorLoading(false);
    }
  };

  // Neuen Artikel (Entwurf) anlegen
  const createNewArticle = () => {
    const newSlug = `neuer-artikel-${Date.now()}`;
    const defaultTitle = "Neuer inspirierender Artikel";
    const defaultCats = "Entfaltung";
    const defaultContent = `---
title: "${defaultTitle}"
category: "${defaultCats}"
level: "Praxis"
date: "${new Date().toISOString().split("T")[0]}"
description: "Eine kurze Beschreibung für das SEO-Meta-Tag und die Blogkarte."
excerpt: "Der kurze Auszug für die Übersicht in Koulners Bubble."
image: "https://image.pollinations.ai/prompt/aesthetic%20cinematic%20photography%20of%20calm%20nature%20forest%20warm%20healing%20light?width=1200&height=600&nologo=true"
readTime: "5 Min. Lesezeit"
author: "${user.name || "Guide"}"
draft: true
---

Beginne hier mit deiner inspirierenden Einleitung...

> Ein markantes Zitat, das die Kernbotschaft zusammenfasst.

## Die erste Hauptüberschrift

Hier folgt das wissenschaftliche oder praktische Fundament deines Textes...

<Grid>
  <div>
    ### Links im Raster
    Sanfte Impulse für die Seele und das Nervensystem.
  </div>
  <div>
    ### Rechts im Raster
    Wissenschaftlich gestützte Erkenntnisse für ganzheitliche Balance.
  </div>
</Grid>

### Rich Media Beispiel

<CustomImage src="https://image.pollinations.ai/prompt/serene%20forest%20sunlight%20mist?width=800&height=450&nologo=true" alt="Sanfter Wald" caption="Die beruhigende Atmosphäre eines morgendlichen Waldes." />
`;
    setEditingSlug(newSlug);
    setRawContent(defaultContent);
    setMetaTitle(defaultTitle);
    setMetaCategories(defaultCats);
    setSaveStatus({ type: "idle" });
  };

  const toggleCategorySelection = (cat: string) => {
    const selectedCats = metaCategories.split(",").map((c) => c.trim()).filter(Boolean);
    let updated: string[];
    if (selectedCats.includes(cat)) {
      updated = selectedCats.filter((c) => c !== cat);
    } else {
      updated = [...selectedCats, cat];
    }
    setMetaCategories(updated.join(", "));
  };

  // Speichern & GitOps Push mit Frontmatter-Aktualisierung
  const handleSave = async () => {
    if (!editingSlug) return;
    setSaveStatus({ type: "saving", message: "Aktualisiere Frontmatter & pushe via GitOps..." });

    try {
      const catArray = metaCategories.split(",").map((s) => s.trim()).filter(Boolean);
      const formattedCat = catArray.length > 1
        ? `[${catArray.map((c) => `"${c}"`).join(", ")}]`
        : `"${catArray[0] || "Allgemein"}"`;

      let updatedContent = rawContent;
      const cleanTitle = metaTitle.replace(/"/g, '\\"');

      if (/^title:\s*.+/m.test(updatedContent)) {
        updatedContent = updatedContent.replace(/^title:\s*.+/m, `title: "${cleanTitle}"`);
      } else {
        updatedContent = updatedContent.replace(/^---(\r?\n)/, `---$1title: "${cleanTitle}"$1`);
      }

      if (/^category:\s*.+/m.test(updatedContent)) {
        updatedContent = updatedContent.replace(/^category:\s*.+/m, `category: ${formattedCat}`);
      } else {
        updatedContent = updatedContent.replace(/^---(\r?\n)/, `---$1category: ${formattedCat}$1`);
      }

      setRawContent(updatedContent);

      const res = await fetch("/api/save-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editingSlug, rawContent: updatedContent }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({
          type: "success",
          message: data.gitOps ? "Erfolgreich via GitOps gepusht!" : "Lokal gespeichert (kein GitHub Token aktiv).",
        });
        fetchArticles();
      } else {
        setSaveStatus({ type: "error", message: data.error || "Fehler beim Speichern." });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err.message || "Netzwerkfehler beim Speichern." });
    }
  };

  // AI Co-Pilot aufrufen
  const handleCopilot = async () => {
    if (!rawContent) return;
    setCopilotLoading(true);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawContent,
          instruction: copilotPrompt || "Überarbeite diesen Text empathisch und verbessere die Lesbarkeit.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.revisedContent) {
        const newContent = data.revisedContent;
        setRawContent(newContent);

        const titleMatch = newContent.match(/^title:\s*(?:["'](.+?)["']|(.+))$/m);
        if (titleMatch) setMetaTitle((titleMatch[1] || titleMatch[2]).trim());

        const catMatch = newContent.match(/^category:\s*(?:["'](.+?)["']|\[(.+?)\]|(.+))$/m);
        if (catMatch) {
          const rawCat = catMatch[1] || catMatch[2] || catMatch[3];
          if (rawCat) setMetaCategories(rawCat.replace(/["']/g, "").trim());
        }

        setCopilotOpen(false);
        setCopilotPrompt("");
        setSaveStatus({ type: "success", message: "Mit Bubble Guide erfolgreich überarbeitet!" });
      } else {
        setSaveStatus({ type: "error", message: data.error || "Co-Pilot Fehler." });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err.message || "Netzwerkfehler beim Co-Pilot." });
    } finally {
      setCopilotLoading(false);
    }
  };

  // Draft Toggle (im YAML Frontmatter umschalten)
  const toggleDraftInContent = () => {
    if (!rawContent) return;
    if (rawContent.includes("draft: true")) {
      setRawContent(rawContent.replace("draft: true", "draft: false"));
    } else if (rawContent.includes("draft: false")) {
      setRawContent(rawContent.replace("draft: false", "draft: true"));
    } else {
      setRawContent(rawContent.replace(/---(\r?\n)/, "---\n$1draft: true\n"));
    }
  };

  // Bulk Actions Handler
  const handleBulkAction = async (action: "draft" | "publish" | "archive" | "delete") => {
    if (selectedSlugs.length === 0) return;
    if (action === "delete" && !confirm(`Möchtest du wirklich ${selectedSlugs.length} Artikel endgültig löschen?`)) {
      return;
    }

    setBulkLoading(true);
    setSaveStatus({ type: "saving", message: `Führe Bulk-Action "${action}" für ${selectedSlugs.length} Artikel aus...` });
    try {
      const res = await fetch("/api/bulk-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: selectedSlugs, action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({
          type: "success",
          message: `${data.message} ${data.gitOps ? "(via GitOps gepusht)" : "(lokal synchronisiert)"}`,
        });
        setSelectedSlugs([]);
        fetchArticles();
      } else {
        setSaveStatus({ type: "error", message: data.error || "Bulk-Action Fehler." });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err?.message || "Netzwerkfehler bei Bulk-Action." });
    } finally {
      setBulkLoading(false);
    }
  };

  const isDraft = rawContent.includes("draft: true");

  const draftsList = articles.filter((a) => a.draft === true && !a.archived);
  const archivedList = articles.filter((a) => a.archived === true);
  const publishedList = articles.filter((a) => !a.draft && !a.archived);

  const currentList = activeTab === "published" ? publishedList : activeTab === "drafts" ? draftsList : archivedList;
  const isAllSelected = currentList.length > 0 && currentList.every((art) => selectedSlugs.includes(art.slug));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSlugs((prev) => prev.filter((slug) => !currentList.some((art) => art.slug === slug)));
    } else {
      const newSlugs = new Set([...selectedSlugs, ...currentList.map((art) => art.slug)]);
      setSelectedSlugs(Array.from(newSlugs));
    }
  };

  const toggleSelectOne = (slug: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return (
    <div className="min-h-screen bg-[#050B08] text-[#E8F0EB] flex flex-col font-sans selection:bg-[#2D5A3C] selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-[#2D5A3C]/30 bg-[#0F1B15]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {editingSlug && (
            <button
              onClick={() => setEditingSlug(null)}
              className="p-2 rounded-xl bg-[#2D5A3C]/20 hover:bg-[#2D5A3C]/40 text-[#A3C9A8] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D5A3C] to-[#1e3e29] flex items-center justify-center border border-[#4E8752]/50 shadow-md">
              <Sparkles className="w-5 h-5 text-[#D9A05B]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Bubble Studio
                <span className="px-2 py-0.5 rounded-full bg-[#2D5A3C]/40 border border-[#4E8752]/40 text-[#A3C9A8] text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#D9A05B]" /> Enterprise Auth • GitOps
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#050B08]/60 border border-[#2D5A3C]/30">
            {user.image && <img src={user.image} alt="User avatar" className="w-6 h-6 rounded-full" />}
            <span className="text-xs font-medium text-[#E8F0EB]">{user.name || user.email || "Whitelist User"}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-medium"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
        {!editingSlug ? (
          /* TABsübersicht (Dashboard) */
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Content Management</h2>
                <p className="text-sm text-[#A3C9A8] mt-1">
                  Verwalte deine Artikel, Entwürfe und automatisierten GitOps-Deployments.
                </p>
              </div>
              <button
                onClick={createNewArticle}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#2D5A3C] to-[#1e3e29] hover:from-[#3a724d] hover:to-[#2D5A3C] text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-[#2D5A3C]/30 border border-[#4E8752]/50 transition-all cursor-pointer w-fit"
              >
                <Plus className="w-5 h-5 text-[#D9A05B]" /> Neuer Artikel (Entwurf)
              </button>
            </div>

            {/* Save / Status Toast */}
            {saveStatus.type !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 shadow-lg ${
                  saveStatus.type === "success"
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                    : saveStatus.type === "error"
                    ? "bg-red-950/80 border-red-500/40 text-red-200"
                    : "bg-blue-950/80 border-blue-500/40 text-blue-200"
                }`}
              >
                {saveStatus.type === "saving" && <RefreshCw className="w-5 h-5 animate-spin shrink-0 text-[#D9A05B]" />}
                {saveStatus.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {saveStatus.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                <span>{saveStatus.message}</span>
              </motion.div>
            )}

            {/* Tabs & Select All Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D5A3C]/30 mb-6 pb-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => { setActiveTab("published"); setSelectedSlugs([]); }}
                  className={`py-2.5 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === "published"
                      ? "border-[#D9A05B] text-[#D9A05B]"
                      : "border-transparent text-[#A3C9A8]/70 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Veröffentlicht ({publishedList.length})
                </button>
                <button
                  onClick={() => { setActiveTab("drafts"); setSelectedSlugs([]); }}
                  className={`py-2.5 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === "drafts"
                      ? "border-[#D9A05B] text-[#D9A05B]"
                      : "border-transparent text-[#A3C9A8]/70 hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4" /> Entwürfe ({draftsList.length})
                </button>
                <button
                  onClick={() => { setActiveTab("archived"); setSelectedSlugs([]); }}
                  className={`py-2.5 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === "archived"
                      ? "border-[#D9A05B] text-[#D9A05B]"
                      : "border-transparent text-[#A3C9A8]/70 hover:text-white"
                  }`}
                >
                  <Archive className="w-4 h-4" /> Archiviert ({archivedList.length})
                </button>
                <button
                  onClick={() => { setActiveTab("categories"); setSelectedSlugs([]); }}
                  className={`py-2.5 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === "categories"
                      ? "border-[#D9A05B] text-[#D9A05B]"
                      : "border-transparent text-[#A3C9A8]/70 hover:text-white"
                  }`}
                >
                  <Tag className="w-4 h-4" /> Kategorien ({availableCategories.length})
                </button>
              </div>

              {/* "Alle auswählen"-Checkbox */}
              {activeTab !== "categories" && currentList.length > 0 && (
                <label className="flex items-center gap-2 text-xs font-semibold text-[#A3C9A8] hover:text-white cursor-pointer select-none px-3.5 py-2 rounded-xl bg-[#0F1B15]/80 border border-[#2D5A3C]/40 shrink-0 shadow-sm transition-colors">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#4E8752] text-[#2D5A3C] focus:ring-[#D9A05B] focus:ring-offset-0 bg-[#050B08] cursor-pointer accent-[#D9A05B]"
                  />
                  <span>Alle auswählen ({currentList.length})</span>
                </label>
              )}
            </div>

            {/* Dynamische Action Bar (nur sichtbar wenn >= 1 Artikel markiert) */}
            <AnimatePresence>
              {selectedSlugs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#1A3825] via-[#2D5A3C] to-[#1A3825] border border-[#D9A05B]/50 shadow-2xl mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#D9A05B] text-[#050B08] font-bold text-xs flex items-center justify-center shadow-md">
                      {selectedSlugs.length}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      Artikel ausgewählt
                    </span>
                    <button
                      onClick={() => setSelectedSlugs([])}
                      className="text-xs text-[#A3C9A8] hover:text-white underline ml-2 cursor-pointer font-medium"
                    >
                      Auswahl aufheben
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleBulkAction("draft")}
                      disabled={bulkLoading}
                      className="py-2 px-3.5 rounded-xl bg-[#0F1B15]/90 hover:bg-[#0F1B15] text-[#A3C9A8] hover:text-white border border-[#4E8752]/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Als Entwurf
                    </button>
                    <button
                      onClick={() => handleBulkAction("publish")}
                      disabled={bulkLoading}
                      className="py-2 px-3.5 rounded-xl bg-[#0F1B15]/90 hover:bg-[#0F1B15] text-[#A3C9A8] hover:text-white border border-[#4E8752]/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Veröffentlichen
                    </button>
                    <button
                      onClick={() => handleBulkAction("archive")}
                      disabled={bulkLoading}
                      className="py-2 px-3.5 rounded-xl bg-[#0F1B15]/90 hover:bg-[#0F1B15] text-[#A3C9A8] hover:text-white border border-[#4E8752]/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
                    >
                      <Archive className="w-3.5 h-3.5 text-blue-400" /> Archivieren
                    </button>
                    <button
                      onClick={() => handleBulkAction("delete")}
                      disabled={bulkLoading}
                      className="py-2 px-3.5 rounded-xl bg-red-950/90 hover:bg-red-900 text-red-200 hover:text-white border border-red-500/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" /> Löschen
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Kategorie Management (Single Source of Truth) oder Artikel Grid */}
            {activeTab === "categories" ? (
              <div className="bg-[#0F1B15]/90 border border-[#2D5A3C]/40 rounded-3xl p-6 shadow-xl max-w-3xl">
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#2D5A3C]/30 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#D9A05B]" /> Zentrales Kategorie-Management
                    </h3>
                    <p className="text-sm text-[#A3C9A8] mt-1">
                      Verwalte die Single Source of Truth für alle Blog-Kategorien (gespeichert in <code className="text-[#D9A05B]">content/categories.json</code>).
                    </p>
                  </div>
                </div>

                {catSaveStatus.type !== "idle" && (
                  <div
                    className={`p-4 rounded-2xl border text-sm font-medium mb-6 flex items-center gap-3 shadow-lg ${
                      catSaveStatus.type === "success"
                        ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                        : catSaveStatus.type === "error"
                        ? "bg-red-950/80 border-red-500/40 text-red-200"
                        : "bg-blue-950/80 border-blue-500/40 text-blue-200"
                    }`}
                  >
                    {catSaveStatus.type === "saving" && <RefreshCw className="w-5 h-5 animate-spin text-[#D9A05B]" />}
                    {catSaveStatus.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {catSaveStatus.type === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
                    <span>{catSaveStatus.message}</span>
                  </div>
                )}

                {/* Neue Kategorie hinzufügen */}
                <div className="flex gap-3 mb-8">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    placeholder="Neue Kategorie eingeben..."
                    className="flex-1 bg-[#050B08] border border-[#2D5A3C]/50 rounded-2xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#D9A05B] transition-colors shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCatInput.trim()}
                    className="py-3 px-6 rounded-2xl bg-[#D9A05B] hover:bg-[#c7904e] disabled:opacity-50 text-[#050B08] font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Hinzufügen
                  </button>
                </div>

                {/* Liste der verfügbaren Kategorien */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A3C9A8]/70 mb-3">
                    Aktive Kategorien ({availableCategories.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableCategories.map((cat) => (
                      <div
                        key={cat}
                        className="p-3.5 rounded-2xl bg-[#050B08]/80 border border-[#2D5A3C]/40 flex items-center justify-between gap-3 group hover:border-[#D9A05B]/50 transition-colors"
                      >
                        <span className="font-medium text-sm text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#D9A05B]" />
                          {cat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60 opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Kategorie löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-[#D9A05B] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentList.map((art) => {
                  const isChecked = selectedSlugs.includes(art.slug);
                  return (
                    <motion.div
                      key={art.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => openEditor(art.slug)}
                      className={`bg-[#0F1B15]/80 border rounded-3xl p-6 flex flex-col justify-between transition-all shadow-lg group relative cursor-pointer ${
                        isChecked
                          ? "border-[#D9A05B] bg-[#1A3825]/40 shadow-[#D9A05B]/10"
                          : "border-[#2D5A3C]/40 hover:border-[#4E8752]/70"
                      }`}
                    >
                      <div>
                        {/* Checkbox vor jedem Artikel */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => toggleSelectOne(art.slug, e)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-[#4E8752] text-[#2D5A3C] focus:ring-[#D9A05B] focus:ring-offset-0 bg-[#050B08] cursor-pointer accent-[#D9A05B]"
                            />
                            <span className="px-2.5 py-1 rounded-full bg-[#2D5A3C]/30 text-[#A3C9A8] text-xs font-medium truncate max-w-[140px]">
                              {Array.isArray(art.category) ? art.category.join(", ") : art.category}
                            </span>
                          </div>
                          <span className="text-xs text-[#A3C9A8]/60">{art.date}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-[#D9A05B] transition-colors line-clamp-2 mb-2">
                          {art.title}
                        </h3>
                        <p className="text-sm text-[#A3C9A8]/80 line-clamp-3 mb-6">{art.excerpt}</p>
                      </div>

                      <div className="pt-4 border-t border-[#2D5A3C]/20 flex items-center justify-between">
                        <span className="text-xs font-mono text-[#A3C9A8]/50 truncate max-w-[150px]">/{art.slug}</span>
                        <span className="py-1.5 px-3 rounded-xl bg-[#2D5A3C]/30 group-hover:bg-[#2D5A3C] text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-[#4E8752]/40">
                          <FileText className="w-3.5 h-3.5 text-[#D9A05B]" /> Editor
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {currentList.length === 0 && (
                  <div className="col-span-full py-16 text-center border border-dashed border-[#2D5A3C]/30 rounded-3xl bg-[#0F1B15]/30">
                    <AlertCircle className="w-10 h-10 text-[#A3C9A8]/40 mx-auto mb-3" />
                    <p className="text-[#A3C9A8]">
                      Keine Artikel in der Kategorie "{activeTab === "published" ? "Veröffentlicht" : activeTab === "drafts" ? "Entwürfe" : "Archiviert"}" vorhanden.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* SPLIT-SCREEN MARKDOWN EDITOR */
          <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
            {/* Editor Action Bar */}
            <div className="bg-[#0F1B15] border border-[#2D5A3C]/40 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#050B08] border border-[#2D5A3C]/30 text-[#D9A05B]">
                  Slug: {editingSlug}
                </span>
                <button
                  onClick={toggleDraftInContent}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isDraft
                      ? "bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60"
                      : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60"
                  }`}
                >
                  {isDraft ? <Clock className="w-3.5 h-3.5 text-amber-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  Status: {isDraft ? "Entwurf (Draft)" : "Veröffentlicht"}
                </button>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* AI Co-Pilot Button */}
                <button
                  onClick={() => setCopilotOpen(!copilotOpen)}
                  disabled={copilotLoading}
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4 text-purple-300 animate-pulse" />
                  <span>Mit Bubble Guide überarbeiten</span>
                </button>

                {/* GitOps Speichern */}
                <button
                  onClick={handleSave}
                  disabled={saveStatus.type === "saving"}
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-[#2D5A3C] to-[#1e3e29] hover:from-[#3a724d] hover:to-[#2D5A3C] text-white border border-[#4E8752]/50 text-xs font-semibold flex items-center gap-2 shadow-lg hover:shadow-[#2D5A3C]/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saveStatus.type === "saving" ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D9A05B]" />
                  ) : (
                    <GitCommit className="w-4 h-4 text-[#D9A05B]" />
                  )}
                  <span>Speichern via GitOps</span>
                </button>
              </div>
            </div>

            {/* Save / Status Toast */}
            {saveStatus.type !== "idle" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  saveStatus.type === "success"
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                    : saveStatus.type === "error"
                    ? "bg-red-950/80 border-red-500/40 text-red-200"
                    : "bg-blue-950/80 border-blue-500/40 text-blue-200"
                }`}
              >
                {saveStatus.type === "saving" && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
                {saveStatus.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {saveStatus.type === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <span>{saveStatus.message}</span>
              </motion.div>
            )}

            {/* AI Co-Pilot Modal/Bar */}
            <AnimatePresence>
              {copilotOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-500/40 flex flex-col sm:flex-row gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Anweisung an den Bubble Guide (z.B. 'Stärke das E-E-A-T Fundament' oder 'Korrigiere Rechtschreibung')..."
                      value={copilotPrompt}
                      onChange={(e) => setCopilotPrompt(e.target.value)}
                      className="flex-1 bg-[#050B08]/80 border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 w-full"
                    />
                    <button
                      onClick={handleCopilot}
                      disabled={copilotLoading}
                      className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {copilotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>Überarbeitung starten</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ablenkungsfreier Split-Screen Editor */}
            {editorLoading ? (
              <div className="flex-1 flex items-center justify-center bg-[#0F1B15]/40 rounded-3xl border border-[#2D5A3C]/30">
                <RefreshCw className="w-8 h-8 text-[#D9A05B] animate-spin" />
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Linker Split: Raw Markdown Editor mit Metadaten-Feldern */}
                <div className="flex flex-col bg-[#0F1B15]/90 border border-[#2D5A3C]/40 rounded-3xl overflow-hidden shadow-xl">
                  <div className="px-5 py-3 border-b border-[#2D5A3C]/30 bg-[#050B08]/60 flex items-center justify-between text-xs font-mono text-[#A3C9A8]/80">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Code className="w-4 h-4 text-[#D9A05B]" /> Markdown & Frontmatter
                    </span>
                    <span>{rawContent.length} Zeichen</span>
                  </div>

                  {/* UI-Anpassung im Editor: Eingabefelder für Titel und Kategorien */}
                  <div className="p-4 border-b border-[#2D5A3C]/30 bg-[#0A140F]/90 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A3C9A8] mb-1">
                        Artikel-Titel
                      </label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="Titel des Artikels..."
                        className="w-full bg-[#050B08] border border-[#2D5A3C]/40 rounded-xl px-3.5 py-2 text-sm text-white font-medium focus:outline-none focus:border-[#D9A05B] transition-colors shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#A3C9A8] mb-1.5 flex items-center justify-between">
                        <span>Kategorien auswählen <span className="text-[#A3C9A8]/60 font-normal">(Multi-Select Dropdown/Pills)</span></span>
                        <span className="text-xs text-[#D9A05B] font-mono">{metaCategories ? metaCategories.split(",").filter(Boolean).length : 0} markiert</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 p-2 bg-[#050B08] border border-[#2D5A3C]/40 rounded-xl max-h-28 overflow-y-auto">
                        {availableCategories.map((cat) => {
                          const selectedCats = metaCategories.split(",").map((c) => c.trim()).filter(Boolean);
                          const isSelected = selectedCats.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategorySelection(cat)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                                isSelected
                                  ? "bg-[#2D5A3C] text-white border-[#D9A05B] shadow-sm shadow-[#D9A05B]/20"
                                  : "bg-[#0A140F] text-[#A3C9A8]/70 border-[#2D5A3C]/30 hover:border-[#4E8752] hover:text-white"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#D9A05B]" : "bg-transparent border border-[#A3C9A8]/50"}`} />
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Interaktive Formatierungs-Toolbar (Sticky über der Textarea) */}
                  <div className="sticky top-0 z-10 flex items-center gap-1 p-2 bg-[#050B08]/95 backdrop-blur-md border-b border-[#2D5A3C]/40 overflow-x-auto selection:bg-transparent text-xs text-[#A3C9A8]">
                    {/* Standard Markdown Buttons */}
                    <div className="flex items-center gap-0.5 pr-2 border-r border-[#2D5A3C]/30">
                      <button
                        type="button"
                        onClick={() => insertSnippet("**", "**", "fetter text")}
                        title="Fett (**text**)"
                        className="p-1.5 rounded-lg hover:bg-[#2D5A3C]/40 hover:text-white transition-colors"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet("*", "*", "kursiver text")}
                        title="Kursiv (*text*)"
                        className="p-1.5 rounded-lg hover:bg-[#2D5A3C]/40 hover:text-white transition-colors"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet("## ", "", "Überschrift 2")}
                        title="Überschrift 2 (## )"
                        className="p-1.5 rounded-lg hover:bg-[#2D5A3C]/40 hover:text-white transition-colors"
                      >
                        <Heading2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet("\n> ", "", "Zitat-Text...")}
                        title="Zitat (> )"
                        className="p-1.5 rounded-lg hover:bg-[#2D5A3C]/40 hover:text-white transition-colors"
                      >
                        <Quote className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet("\n- ", "", "Listenpunkt")}
                        title="Aufzählungsliste (- )"
                        className="p-1.5 rounded-lg hover:bg-[#2D5A3C]/40 hover:text-white transition-colors"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Magic MDX & Media Buttons */}
                    <div className="flex items-center gap-1 pl-2 flex-wrap">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && uploadAndInsertImage(e.target.files[0])}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Bild hochladen (S3 Drag & Drop oder Klick)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D5A3C]/30 hover:bg-[#2D5A3C]/60 text-white font-medium transition-colors border border-[#D9A05B]/40 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#D9A05B]" />
                        <span className="hidden sm:inline">Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(
                            '\n<CustomImage alt="Beschreibung" caption="Bildunterschrift" src="https://image.pollinations.ai/prompt/calm%20nature%20forest?width=800&height=450&nologo=true" />\n'
                          )
                        }
                        title="Bild einfügen (<CustomImage />)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D5A3C]/20 hover:bg-[#2D5A3C]/40 text-[#D9A05B] font-medium transition-colors border border-[#D9A05B]/20"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bild URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet('\n<YouTube id="dQw4w9WgXcQ" />\n')}
                        title="Video einfügen (<YouTube />)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D5A3C]/20 hover:bg-[#2D5A3C]/40 text-[#D9A05B] font-medium transition-colors border border-[#D9A05B]/20"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(
                            '\n<Grid>\n  <div>\n    ### Spalte 1\n    Füge hier Element 1 ein\n  </div>\n  <div>\n    ### Spalte 2\n    Füge hier Element 2 ein\n  </div>\n</Grid>\n'
                          )
                        }
                        title="Layout Grid (<Grid />)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D5A3C]/20 hover:bg-[#2D5A3C]/40 text-[#D9A05B] font-medium transition-colors border border-[#D9A05B]/20"
                      >
                        <Layout className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Grid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertSnippet(
                            '\n| Spalte 1 | Spalte 2 |\n| --- | --- |\n| Wert 1 | Wert 2 |\n| Wert 3 | Wert 4 |\n'
                          )
                        }
                        title="Tabelle (2x2)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D5A3C]/20 hover:bg-[#2D5A3C]/40 text-[#D9A05B] font-medium transition-colors border border-[#D9A05B]/20"
                      >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tabelle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertSnippet("\n<TableOfContents />\n\n")}
                        title="Inhaltsverzeichnis (<TableOfContents />)"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2D5A3C]/20 hover:bg-[#2D5A3C]/40 text-[#D9A05B] font-medium transition-colors border border-[#D9A05B]/20"
                      >
                        <ListTree className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">TOC</span>
                      </button>
                    </div>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 flex flex-col relative transition-all duration-200 ${
                      isDragging ? "bg-[#2D5A3C]/25 border-2 border-dashed border-[#D9A05B] rounded-2xl m-2" : ""
                    }`}
                  >
                    {isDragging && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050B08]/85 backdrop-blur-sm pointer-events-none rounded-2xl">
                        <Upload className="w-12 h-12 text-[#D9A05B] animate-bounce mb-3" />
                        <span className="text-base font-bold text-white tracking-wide">Bild hier ablegen für S3-Upload</span>
                        <span className="text-xs text-[#A3C9A8] mt-1 font-mono">(.png, .jpg, .webp wird sofort hochgeladen und eingefügt)</span>
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2D5A3C] to-[#1e3e29] text-white text-xs font-semibold shadow-xl border border-[#D9A05B]/40 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#D9A05B]" />
                        Lade Bild auf S3-Speicher hoch...
                      </div>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={rawContent}
                      onChange={(e) => setRawContent(e.target.value)}
                      placeholder="Schreibe oder paste hier deinen Markdown-Inhalt... (💡 Tipp: Bilder einfach per Drag & Drop auf diesen Bereich ziehen!)"
                      className="flex-1 p-5 bg-transparent text-sm font-mono text-[#E8F0EB] focus:outline-none resize-none leading-relaxed overflow-y-auto"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Rechter Split: Live Markdown Preview */}
                <div className="flex flex-col bg-[#0F1B15]/90 border border-[#2D5A3C]/40 rounded-3xl overflow-hidden shadow-xl">
                  <div className="px-5 py-3 border-b border-[#2D5A3C]/30 bg-[#050B08]/60 flex items-center justify-between text-xs font-mono text-[#A3C9A8]/80">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Eye className="w-4 h-4 text-[#D9A05B]" /> Live Vorschau
                    </span>
                    <span>Koulners Bubble Rendering</span>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#E8F0EB]/90 prose-a:text-[#D9A05B] prose-blockquote:border-[#D9A05B] prose-blockquote:bg-[#2D5A3C]/10 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSlug]}
                      components={mdxComponents as any}
                    >
                      {rawContent.replace(/^---[\s\S]+?---(\r?\n)/, "") || "*Vorschau des Artikels...*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
