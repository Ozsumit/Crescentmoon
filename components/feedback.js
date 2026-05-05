"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Star, Bug, Lightbulb, CheckCircle2, X } from "lucide-react";
import { submitFeedback } from "../action"; // Adjust path as needed

// ==========================================
// 1. SHARED MICRO COMPONENTS
// ==========================================
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

// ==========================================
// 2. SHARED FORM LOGIC & UI (DRY Principle)
// ==========================================
const FeedbackFormCore = ({ isPopup = false, onSuccessfulSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    type: "review",
    rating: 1,
    message: "",
    email: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSubmitting(true);
    const res = await submitFeedback(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      // Save to localStorage so popup never bothers them again
      localStorage.setItem("feedback_submitted", "true");

      if (onSuccessfulSubmit) onSuccessfulSubmit();

      // Reset form after 4 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({ type: "review", rating: 1, message: "", email: "" });
      }, 4000);
    }
  };

  // --- Dynamic Styles based on Component Type ---
  const pulseDotClass = isPopup
    ? "bg-[#c3f0c2] shadow-[0_0_8px_#c3f0c2]"
    : "bg-white/20";

  const successContainerClass = isPopup
    ? "flex flex-col items-center justify-center py-10 text-center"
    : "flex flex-col items-center justify-center py-10 text-center border border-white/10 rounded-2xl bg-white/5";

  const focusBorderClass = isPopup
    ? "focus:border-[#c3f0c2]/40"
    : "focus:border-white/40";

  const submitBtnClass = isPopup
    ? "bg-[#c3f0c2] text-black hover:bg-[#a6e8a5] shadow-[0_0_15px_rgba(195,240,194,0.3)]"
    : "bg-[#c3f0c2] text-black hover:bg-[#8bfca9]";

  return (
    <>
      <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${pulseDotClass}`}
        ></span>
        Developer Uplink
      </h3>

      <div className="relative">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={successContainerClass}
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

              {/* Dynamic Rating */}
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
                          className={`p-1.5 rounded-lg transition-all ${formData.rating >= star ? "text-yellow-400" : "text-neutral-600 hover:text-neutral-400"}`}
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

              {/* Inputs */}
              <div className="flex flex-col gap-2">
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your issue or feedback..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:bg-white/10 transition-all resize-none ${focusBorderClass}`}
                />
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:bg-white/10 transition-all ${focusBorderClass}`}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.message.trim()}
                    className={`
                      px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all
                      ${isSubmitting || !formData.message.trim() ? "bg-white/5 text-neutral-500 cursor-not-allowed" : submitBtnClass}
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
    </>
  );
};

// ==========================================
// 3. EXPORT: STATIC COMPONENT (Original Design)
// ==========================================
export function StaticDeveloperFeedback() {
  return (
    <div className="w-full max-w-lg">
      {/* isPopup defaults to false, triggering original styles */}
      <FeedbackFormCore />
    </div>
  );
}

// ==========================================
// 4. EXPORT: POPUP COMPONENT (Floating/Pulsating)
// ==========================================
export function PopupDeveloperFeedback() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastDismissed = localStorage.getItem("feedback_dismissed");
    const feedbackSubmitted = localStorage.getItem("feedback_submitted");

    // Don't show if they already submitted feedback via either form
    if (feedbackSubmitted) return;

    // Check if clicked "X" in the last 24 hours
    if (lastDismissed) {
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(lastDismissed) < oneDayInMs) return;
    }

    const timer = setTimeout(() => setIsVisible(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("feedback_dismissed", Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[9999] w-full max-w-[400px]"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full"
          >
            {/* Pulsating Colored Glow Effect */}
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-[#c3f0c2]/60 via-teal-500/30 to-[#8bfca9]/60 opacity-70 blur-[4px] animate-pulse" />

            {/* Main Card Wrapper specific to the Popup */}
            <div className="relative overflow-hidden bg-neutral-950/95 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-20"
                title="Dismiss for 24 hours"
              >
                <X size={18} />
              </button>

              {/* isPopup triggers the green glows and omits duplicate inner borders */}
              <FeedbackFormCore
                isPopup={true}
                onSuccessfulSubmit={() => {
                  setTimeout(() => setIsVisible(false), 3000);
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
