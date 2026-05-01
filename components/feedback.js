"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Star, Bug, Lightbulb, CheckCircle2 } from "lucide-react";
import { submitFeedback } from "../action"; // Adjust path as needed

// --- MICRO COMPONENTS ---
const TypeChip = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 flex-1 justify-center overflow-hidden border
      ${active ? "border-white bg-white text-black" : "border-white/10 bg-transparent text-neutral-400 hover:bg-white/5"}
    `}
  >
    <span className="relative z-10 flex items-center gap-1.5">
      <Icon size={14} /> {label}
    </span>
  </button>
);

// --- MAIN COMPONENT ---
export default function DeveloperFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: "review", // 'review', 'bug', 'feature'
    rating: 1,
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
        setSuccess(false);
        setFormData({ type: "review", rating: 1, message: "", email: "" });
      }, 4000);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse"></span>
        Developer Uplink
      </h3>

      <div className="relative">
        <AnimatePresence mode="wait">
          {success ? (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-10 text-center border border-white/10 rounded-2xl bg-white/5"
            >
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                Transmission Sent
              </h3>
              <p className="text-xs text-neutral-400">
                Thank you. The developer has received your logs.
              </p>
            </motion.div>
          ) : (
            /* Form State */
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {/* Type Selector */}
              <div className="flex gap-2 w-full">
                <TypeChip
                  active={formData.type === "review"}
                  onClick={() => setFormData({ ...formData, type: "review" })}
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
                  onClick={() => setFormData({ ...formData, type: "feature" })}
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
                    className="flex flex-col items-start gap-1 overflow-hidden"
                  >
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          className={`p-1.5 rounded-lg transition-all ${
                            formData.rating >= star
                              ? "text-yellow-400"
                              : "text-neutral-600 hover:text-neutral-400"
                          }`}
                        >
                          <Star
                            size={18}
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
              <div className="flex flex-col gap-2">
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your issue or feedback..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all resize-none"
                />
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.message.trim()}
                    className={`
                      px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all
                      ${
                        isSubmitting || !formData.message.trim()
                          ? "bg-white/5 text-neutral-500 cursor-not-allowed"
                          : "bg-[#c3f0c2] text-black hover:bg-[#8bfca9]"
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
                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
