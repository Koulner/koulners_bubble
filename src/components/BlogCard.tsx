"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogPostMeta } from "@/lib/content";
import { normalizeCategories } from "@/lib/categories";
import { Clock, ArrowUpRight, Sparkles } from "lucide-react";

interface BlogCardProps {
  post: BlogPostMeta;
  index: number;
  isFeatured?: boolean;
  spanClass?: string;
}

export default function BlogCard({ post, index, isFeatured = false, spanClass = "" }: BlogCardProps) {
  const categories = normalizeCategories(post.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut", delay: (index % 6) * 0.12 }}
      className={`group relative flex flex-col justify-end rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/25 transition-all duration-700 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ${spanClass}`}
    >
      {/* 1. Hintergrund-Bild mit weichem 1-Sekunden Zoom & Brightness Hover */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover object-center transform-gpu brightness-[0.8] group-hover:brightness-100 transition-all duration-1000 ease-out group-hover:scale-105"
        />
        {/* Magazin Gradient-Overlays für exzellenten Kontrast */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${
            isFeatured
              ? "from-[#050B08] via-[#050B08]/60 to-transparent opacity-95 group-hover:opacity-85"
              : "from-[#050B08] via-[#050B08]/75 to-black/20 opacity-95 group-hover:opacity-90"
          } transition-opacity duration-700`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.08] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Bar: Kategorie Pills & Lesezeit im Glassmorphism-Stil */}
      <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-1.5 max-w-[75%] pointer-events-auto">
          {categories.map((cat, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 font-sans text-xs tracking-wider uppercase font-medium border border-white/15 shadow-sm transition-colors"
            >
              {cat}
            </span>
          ))}
          {isFeatured && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D9A05B]/80 text-[#050B08] font-sans text-xs tracking-wider uppercase font-bold shadow-md">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-white/80 text-xs font-mono bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shrink-0">
          <Clock className="w-3 h-3 text-[#D9A05B]" />
          <span>{post.readTime || "5 Min."}</span>
        </div>
      </div>

      {/* 3. Magazin Content-Bereich über dem Glass-Hintergrund */}
      <div
        className={`relative z-10 flex flex-col justify-end p-6 sm:p-8 ${
          isFeatured ? "md:p-10 lg:p-12" : ""
        } transition-transform duration-700`}
      >
        {/* Datum & Autor */}
        <div className="flex items-center gap-2 text-xs font-sans text-[#A3C9A8]/80 mb-3 tracking-wide">
          <span>{post.date}</span>
          <span>•</span>
          <span className="italic text-white/90">{post.author}</span>
        </div>

        {/* Titel (Serifenschrift, passend zum Zitat im Hero) */}
        <Link href={`/blog/${post.slug}`} className="block group/title focus:outline-none">
          <h2
            className={`font-serif text-white font-normal tracking-tight leading-snug mb-3 group-hover/title:text-[#D9A05B] transition-colors duration-500 ${
              isFeatured ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl" : "text-xl sm:text-2xl"
            }`}
          >
            {post.title}
          </h2>
        </Link>

        {/* Auszug (Excerpt) */}
        <p
          className={`font-sans text-[#E8F0EB]/80 leading-relaxed mb-6 font-light ${
            isFeatured ? "text-sm sm:text-base md:text-lg line-clamp-3 max-w-3xl" : "text-xs sm:text-sm line-clamp-2"
          }`}
        >
          {post.excerpt}
        </p>

        {/* Action Bar (In Ruhe lesen Button) */}
        <div className="pt-4 border-t border-white/15 flex items-center justify-between">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-white/90 font-medium group-hover:text-[#D9A05B] transition-colors"
          >
            <span>In Ruhe lesen</span>
            <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#D9A05B] group-hover:text-[#050B08] transition-all duration-300 border border-white/15">
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>

          <span className="text-[10px] text-white/40 font-mono tracking-widest">
            EDITION #{0}{index + 1}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
