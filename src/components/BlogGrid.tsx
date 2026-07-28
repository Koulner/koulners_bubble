"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPostMeta } from "@/lib/content";
import { normalizeCategories } from "@/lib/categories";
import { Clock, ArrowUpRight, Sparkles } from "lucide-react";

interface BlogGridProps {
  posts: BlogPostMeta[];
  activeCategory: string;
}

export default function BlogGrid({ posts, activeCategory }: BlogGridProps) {
  const filteredPosts =
    activeCategory === "Alle"
      ? posts
      : posts.filter((post) => {
          const cats = normalizeCategories(post.category);
          return cats.includes(activeCategory);
        });

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pb-24">
      <AnimatePresence mode="popLayout">
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-border-warm"
          >
            <Sparkles className="w-8 h-8 text-sage mx-auto mb-4 animate-spin-slow" />
            <h3 className="font-serif text-xl text-text-dark mb-2">
              Keine Artikel in dieser Kategorie gefunden
            </h3>
            <p className="text-sm text-text-muted">
              Der Agent Hermes wird in Kürze neue Gedanken für diesen Raum generieren.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-10"
          >
            {filteredPosts.map((post, index) => (
              <motion.article
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                key={post.slug}
                className="group relative flex flex-col bg-bg-card rounded-3xl border border-border-warm/70 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-700"
                whileHover={{
                  y: -6,
                  boxShadow: "0 20px 40px -15px rgba(44, 39, 35, 0.08)",
                  borderColor: "rgba(122, 154, 139, 0.5)",
                }}
              >
                {/* 1. Bild-Container mit sanftem Zoom-Hover */}
                <Link href={`/blog/${post.slug}`} className="relative h-64 md:h-72 w-full overflow-hidden block">
                  <motion.img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Kategorie Badges auf dem Bild */}
                  <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-1.5 max-w-[80%]">
                    {normalizeCategories(post.category).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-text-dark font-sans text-xs tracking-wider font-medium shadow-sm border border-white/60"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Lesezeit unten rechts im Bild */}
                  <div className="absolute bottom-4 right-5 z-10 flex items-center gap-1.5 text-white/90 text-xs font-sans bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime || "4 Min."}</span>
                  </div>
                </Link>

                {/* 2. Text- und Inhalt-Bereich */}
                <div className="p-8 flex flex-col flex-1 justify-between bg-gradient-to-b from-bg-card to-white/50">
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-muted font-sans mb-3">
                      <span>{post.date}</span>
                      <span className="italic text-sage-dark">{post.author}</span>
                    </div>

                    <Link href={`/blog/${post.slug}`} className="block group/link">
                      <h2 className="font-serif text-2xl md:text-3xl text-text-dark font-normal leading-snug mb-4 group-hover/link:text-sage-dark transition-colors duration-300">
                        {post.title}
                      </h2>
                    </Link>

                    <p className="text-text-muted font-sans text-sm md:text-base leading-relaxed line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Sanfter "Weiterlesen" Button */}
                  <div className="pt-4 border-t border-border-warm/40 flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-text-dark font-medium group-hover:text-sage-dark transition-colors"
                    >
                      <span>In Ruhe lesen</span>
                      <div className="w-6 h-6 rounded-full bg-bg-sand flex items-center justify-center group-hover:bg-sage group-hover:text-white transition-all duration-300">
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </Link>

                    <span className="text-[10px] text-text-muted/60 font-mono">
                      BUBBLE READ #0{index + 1}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
