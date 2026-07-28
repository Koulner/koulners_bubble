"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogPostFull, BlogPostMeta } from "@/lib/content";
import { normalizeCategories } from "@/lib/categories";
import { ArrowLeft, Clock, Calendar, User, Sparkles, Share2, Heart } from "lucide-react";
import RelatedArticles from "./RelatedArticles";

interface BlogPostClientProps {
  post: BlogPostFull;
  relatedPosts?: BlogPostMeta[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  return (
    <div className="min-h-screen bg-bg-cream text-text-dark pb-24 selection:bg-sage-light">
      {/* 1. Softe Navigation oben */}
      <nav className="sticky top-0 z-40 w-full bg-bg-cream/80 backdrop-blur-md border-b border-border-warm/60 py-4 px-6 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-text-muted hover:text-text-dark transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-bg-sand flex items-center justify-center group-hover:bg-sage group-hover:text-white transition-all duration-300">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span>Zurück in die Bubble</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
            <span className="font-serif text-sm tracking-wide text-text-dark hidden sm:inline">
              Koulners <span className="italic font-light text-sage-dark">Journal</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-10 md:pt-16">
        {/* 2. Header des Artikels */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-start mb-10"
        >
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            {normalizeCategories(post.category).map((cat, idx) => (
              <span
                key={idx}
                className="px-4 py-1.5 rounded-full bg-sage-light text-sage-dark font-sans text-xs uppercase tracking-widest font-medium border border-sage/20"
              >
                {cat}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-xs text-text-muted font-sans ml-1">
              <Clock className="w-3.5 h-3.5 text-sage" />
              {post.readTime || "4 Min. Lesezeit"}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-text-dark font-normal leading-tight md:leading-snug tracking-tight mb-8">
            {post.title}
          </h1>

          <div className="w-full flex items-center justify-between py-4 border-y border-border-warm text-xs font-sans text-text-muted">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-terracotta" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-text-dark">
                <User className="w-3.5 h-3.5 text-sage" />
                {post.author}
              </span>
            </div>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link zur schützenden Bubble wurde kopiert!");
                }
              }}
              className="flex items-center gap-1.5 hover:text-text-dark transition-colors"
              title="Artikel teilen"
            >
              <Share2 className="w-3.5 h-3.5 text-sage" />
              <span className="hidden sm:inline">Teilen</span>
            </button>
          </div>
        </motion.header>

        {/* 3. Hero-Bild */}
        {post.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full h-[70vh] max-h-[500px] rounded-3xl overflow-hidden mb-12 shadow-xl border border-border-warm"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        )}

        {/* 4. Markdown-Inhalt (Sanft formatiert) */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="prose prose-lg max-w-none font-sans text-text-dark/90 leading-relaxed space-y-6
            prose-headings:font-serif prose-headings:font-normal prose-headings:text-text-dark prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-border-warm/50 prose-h2:pb-3
            prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-base prose-p:md:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-p:text-text-dark/85
            prose-a:text-sage-dark prose-a:underline prose-a:decoration-sage/40 hover:prose-a:decoration-sage
            prose-blockquote:border-l-4 prose-blockquote:border-sage prose-blockquote:bg-bg-sand/60 prose-blockquote:px-6 prose-blockquote:py-5 prose-blockquote:rounded-r-2xl prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-text-dark prose-blockquote:my-8 prose-blockquote:shadow-sm
            prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-3
            prose-strong:font-semibold prose-strong:text-text-dark"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* 4.5 Verwandte Artikel (Related Articles) */}
        {relatedPosts && relatedPosts.length > 0 && (
          <RelatedArticles posts={relatedPosts} />
        )}

        {/* 5. Fußbereich des Artikels */}
        <div className="mt-16 pt-12 border-t border-border-warm flex flex-col items-center text-center gap-6">

          <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center text-sage-dark shadow-sm">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>

          <div className="max-w-md">
            <h4 className="font-serif text-xl text-text-dark mb-2">
              Hat dir dieser Gedanke Ruhe geschenkt?
            </h4>
            <p className="text-sm font-sans text-text-muted">
              Lass diese Worte etwas nachwirken. Atme tief durch und kehre in die Bubble zurück, wenn du bereit bist.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-sage text-white font-sans text-xs uppercase tracking-widest font-medium shadow-lg shadow-sage/25 hover:bg-sage-dark transition-all duration-300"
          >
            <Heart className="w-4 h-4 fill-white/30" />
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
