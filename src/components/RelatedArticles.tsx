"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogPostMeta } from "@/lib/content";
import { normalizeCategories } from "@/lib/categories";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

interface RelatedArticlesProps {
  posts: BlogPostMeta[];
}

export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 pt-16 border-t border-border-warm/80">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center text-sage-dark shadow-xs">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-2xl md:text-3xl text-text-dark font-normal tracking-tight">
            Verwandte Gedanken
          </h3>
          <p className="text-xs font-sans text-text-muted mt-0.5">
            Vertiefe dein Wissen mit passenden Impulsen aus derselben Kategorie
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
          >
            <Link href={`/blog/${post.slug}`} className="group block h-full focus:outline-none">
              <article className="h-full flex flex-col bg-bg-cream/90 rounded-2xl overflow-hidden border border-border-warm/70 shadow-xs hover:shadow-lg transition-all duration-300">
                {/* Bild-Bereich mit weichem Hover-Zoom */}
                {post.image ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-bg-sand">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%]">
                      {normalizeCategories(post.category).map((cat, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-bg-cream/95 backdrop-blur-xs text-sage-dark font-sans text-[10px] font-semibold uppercase tracking-wider shadow-2xs border border-border-warm/50"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex flex-wrap gap-1">
                    {normalizeCategories(post.category).map((cat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-sage-light text-sage-dark font-sans text-[10px] font-semibold uppercase tracking-wider"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {/* Text-Bereich */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="font-serif text-lg text-text-dark font-normal leading-snug group-hover:text-sage-dark transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <p className="font-sans text-xs text-text-muted leading-relaxed line-clamp-2">
                      {post.excerpt || post.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-border-warm/50 flex items-center justify-between text-xs font-sans text-text-muted">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3 h-3 text-sage" />
                      {post.readTime || "5 Min. Lesezeit"}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-sage-dark group-hover:text-sage transition-colors text-[11px]">
                      <span>Lesen</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
