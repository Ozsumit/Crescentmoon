"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Star,
  Bug,
  Lightbulb,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { submitFeedback } from "../action"; // Adjust path as needed

// --- MICRO COMPONENTS ---

const TypeChip = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 flex-1 justify-center overflow-hidden
      ${active ? "text-[#001d35]" : "text-neutral-400 border border-white/5 hover:bg-white/5"}
    `}
  >
    {active && (
      <motion.div
        layoutId="activeType"
        className="absolute inset-0 bg-[#cce5ff] z-0"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      <Icon size={14} /> {label}
    </span>
  </button>
);

// --- MAIN COMPONENT ---

export default function DeveloperFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: "review", // 'review', 'bug', 'feature'
    rating: 5,
    message: "",
    email: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSubmitting(true);

    // Call Server Action
    const res = await submitFeedback(formData);

    setIsSubmitting(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setFormData({ type: "review", rating: 5, message: "", email: "" });
      }, 3000);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-24 right-8 z-40 h-14 w-14 rounded-[1.5rem] bg-[#ffffff] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-2xl transition-opacity ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <Terminal size={20} className="text-[#000000]" />
      </motion.button>

      {/* Glassmorphic Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white leading-none mb-1">
                    Developer Uplink
                  </h2>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                    Send diagnostics & feedback
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {success ? (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
                    Transmission Sent
                  </h3>
                  <p className="text-xs text-neutral-400">
                    The developer has received your logs.
                  </p>
                </motion.div>
              ) : (
                /* Form State */
                <form
                  onSubmit={handleSubmit}
                  className="p-6 flex flex-col gap-5"
                >
                  {/* Type Selector */}
                  <div className="flex gap-2 bg-black/40 p-1.5 rounded-full border border-white/5">
                    <TypeChip
                      active={formData.type === "review"}
                      onClick={() =>
                        setFormData({ ...formData, type: "review" })
                      }
                      icon={Star}
                      label="Review"
                    />
                    <TypeChip
                      active={formData.type === "bug"}
                      onClick={() => setFormData({ ...formData, type: "bug" })}
                      icon={Bug}
                      label="Bug"
                    />
                    <TypeChip
                      active={formData.type === "feature"}
                      onClick={() =>
                        setFormData({ ...formData, type: "feature" })
                      }
                      icon={Lightbulb}
                      label="Idea"
                    />
                  </div>

                  {/* Dynamic Rating (Only for reviews) */}
                  <AnimatePresence>
                    {formData.type === "review" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center gap-2 pt-2"
                      >
                        <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest">
                          Experience Rating
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, rating: star })
                              }
                              className={`p-2 rounded-xl transition-all ${formData.rating >= star ? "text-yellow-400 scale-110" : "text-neutral-600 hover:text-neutral-400"}`}
                            >
                              <Star
                                size={24}
                                className={
                                  formData.rating >= star ? "fill-current" : ""
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input Fields */}
                  <div className="space-y-3">
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe your issue or feedback..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full bg-[#111] border border-white/5 rounded-2xl p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#d0bcff]/50 focus:bg-[#1a1a1a] transition-all resize-none custom-scrollbar"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional, for follow-up)"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-[#111] border border-white/5 rounded-xl p-4 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#d0bcff]/50 focus:bg-[#1a1a1a] transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.message.trim()}
                    className={`
                      w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all mt-2
                      ${
                        isSubmitting || !formData.message.trim()
                          ? "bg-white/5 text-neutral-500 cursor-not-allowed"
                          : "bg-[#d0bcff] text-[#381e72] hover:bg-[#eaddff]"
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-[#381e72] border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <Send size={16} /> Send Transmission
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
