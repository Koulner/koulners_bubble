"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageCircleHeart, X, Send, Bot, User, Maximize2, Minimize2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

interface Message {
  role: "assistant" | "user";
  content: string;
}

export default function BubbleMentor() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hallo, ich bin dein **Bubble Guide** ✨\n\nIch begleite dich sanft durch Koulners Bubble und kenne all unsere Artikel zu Natur, Philosophie, Gesundheit, Kosmetik, Ernährung, Frequenzen und Funktionellem Training.\n\nWas möchtest du heute für dein Wohlbefinden erfahren?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, pathname, turnstileToken }),
      });

      if (!response.ok) {
        throw new Error("Fehler bei der Anfrage");
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply || "Ich sammle meine Gedanken, bitte atme tief durch.",
          },
        ]);
      } else {
        // Live-Streaming der Antwort vom LLM
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        // Platzhalter für die generierte Nachricht anlegen
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;

            // Chat in Echtzeit flüssig Token für Token aktualisieren
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantContent,
              };
              return updated;
            });
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Verzeih mir, die Verbindung zu meinem Wissensfluss war kurz unterbrochen. Bitte versuche es gleich noch einmal. 🌿",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 font-sans md:bottom-6 md:right-6 pb-safe pr-safe">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className={`fixed inset-0 w-full h-full md:inset-auto md:bottom-28 md:right-6 z-50 bg-surface/95 md:bg-surface/95 backdrop-blur-xl border-0 md:border border-sand/50 rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-text-main transition-all duration-300 ${
              isExpanded
                ? "md:max-w-[800px] md:w-[800px] md:h-[82vh] md:max-h-[760px]"
                : "md:max-w-[440px] md:w-[440px] md:h-[560px]"
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-sand/30 border-b border-sand/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-sage/20 border border-sage/40 flex items-center justify-center text-sage">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-text-main flex items-center gap-1.5">
                    Bubble Guide
                  </h3>
                  <p className="text-[11px] text-text-muted">Sanfter KI-Mentor & Wissenshüter</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden md:flex p-2 rounded-full hover:bg-sand/50 text-text-muted hover:text-text-main transition-colors min-touch items-center justify-center"
                  aria-label={isExpanded ? "Chat verkleinern" : "Chat vergrößern"}
                  title={isExpanded ? "Verkleinern" : "Vergrößern"}
                >
                  {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-sand/50 text-text-muted hover:text-text-main transition-colors min-touch flex items-center justify-center"
                  aria-label="Chat schließen"
                  title="Schließen"
                >
                  <X className="w-6 h-6 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                      msg.role === "user"
                        ? "bg-terracotta text-white"
                        : "bg-sage/20 text-sage border border-sage/30"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl leading-relaxed ${
                      msg.role === "user"
                        ? "max-w-[78%] bg-terracotta text-white rounded-tr-none shadow-sm whitespace-pre-wrap"
                        : `${isExpanded ? "max-w-[96%]" : "max-w-[92%]"} bg-white/95 border border-sand/40 text-text-main rounded-tl-none shadow-sm overflow-hidden`
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children }) => (
                            <div className="my-2.5 w-full overflow-x-auto rounded-xl border border-sand/60 bg-sand/15 shadow-2xs">
                              <table className="w-full text-left text-xs border-collapse">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-sage/15 border-b border-sand/60 text-sage-dark font-serif font-medium">{children}</thead>
                          ),
                          tbody: ({ children }) => <tbody className="divide-y divide-sand/40">{children}</tbody>,
                          tr: ({ children }) => <tr className="hover:bg-sand/20 transition-colors">{children}</tr>,
                          th: ({ children }) => <th className="px-3 py-2 font-semibold text-text-main whitespace-nowrap">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-2 text-text-main/90 align-top leading-relaxed">{children}</td>,
                          a: ({ href, children }) => {
                            const isInternal = href && (href.startsWith("/") || href.startsWith("#"));
                            if (isInternal) {
                              return (
                                <Link
                                  href={href}
                                  className="font-medium text-sage-dark underline decoration-sage/60 underline-offset-4 hover:decoration-sage hover:text-sage transition-colors inline-flex items-center gap-0.5"
                                >
                                  {children}
                                </Link>
                              );
                            }
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sage-dark underline decoration-sage/60 underline-offset-4 hover:decoration-sage hover:text-sage transition-colors inline-flex items-center gap-0.5"
                              >
                                {children}
                              </a>
                            );
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-text-main">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-sage bg-sage/5 my-2 pl-3 py-1.5 rounded-r-lg italic text-text-main/90 font-serif text-xs">
                              {children}
                            </blockquote>
                          ),
                          ul: ({ children }) => <ul className="list-disc pl-4 my-1.5 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-snug">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}


              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5 items-center"
                >
                  <div className="w-7 h-7 rounded-full bg-sage/20 text-sage border border-sage/30 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-white/80 border border-sand/40 px-4 py-3 rounded-2xl rounded-tl-none flex space-x-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-sage/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sage/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-sage/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-sand/20 border-t border-sand/40 pb-safe">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Erzähl mir von deinen Gedanken..."
                  disabled={isLoading}
                  className="w-full pl-5 pr-14 py-4 rounded-full bg-white/70 border border-sand/60 focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 transition-all text-sm shadow-sm disabled:opacity-50 min-touch"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2.5 bg-sage hover:bg-sage-dark text-white rounded-full transition-all disabled:opacity-40 disabled:hover:bg-sage min-touch flex items-center justify-center"
                  aria-label="Nachricht senden"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </div>
              
              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                <div className="hidden">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-sage text-white shadow-xl flex items-center justify-center hover:bg-sage-dark transition-colors border-2 border-white/20 min-touch"
            aria-label="Bubble Guide öffnen"
          >
            <MessageCircleHeart className="w-7 h-7 md:w-8 md:h-8" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
