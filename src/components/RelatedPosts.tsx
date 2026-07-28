import React from "react";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/content";
import { ArrowRight, Clock } from "lucide-react";

interface RelatedPostsProps {
  posts: BlogPostMeta[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-border-warm/40">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-serif text-2xl text-text-dark">Tiefer eintauchen</h3>
        <Link href="/" className="hidden sm:flex items-center gap-2 text-sm font-sans text-sage hover:text-sage-dark transition-colors uppercase tracking-wider">
          <span>Alle Artikel</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block focus:outline-none">
            <article className="flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-2xl border border-border-warm/50 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transform-gpu transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-[11px] font-sans text-text-muted uppercase tracking-widest mb-3">
                  <span className="text-sage font-medium">{Array.isArray(post.category) ? post.category[0] : post.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <h4 className="font-serif text-lg text-text-dark font-medium leading-snug mb-2 group-hover:text-sage transition-colors">
                  {post.title}
                </h4>
                <p className="font-sans text-sm text-text-muted line-clamp-2 mt-auto">
                  {post.excerpt}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 sm:hidden flex justify-center">
        <Link href="/" className="flex items-center gap-2 text-sm font-sans text-sage hover:text-sage-dark transition-colors uppercase tracking-wider border border-sage/30 px-6 py-2.5 rounded-full">
          <span>Zurück zur Übersicht</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
