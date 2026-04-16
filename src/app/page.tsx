"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STYLES = [
  { id: "streetwear", label: "Streetwear", emoji: "🔥" },
  { id: "vintage", label: "Vintage", emoji: "🎞️" },
  { id: "minimal", label: "Minimal", emoji: "⬜" },
  { id: "bold", label: "Bold/Graphic", emoji: "💥" },
  { id: "luxury", label: "Luxury", emoji: "✦" },
  { id: "sports", label: "Sports", emoji: "⚡" },
];

const PRODUCTS = [
  { id: "tee", label: "T-Shirt", icon: "👕" },
  { id: "hoodie", label: "Hoodie", icon: "🧥" },
  { id: "crew", label: "Crew Neck", icon: "👔" },
  { id: "cap", label: "Cap", icon: "🧢" },
];

const LOADING_STEPS = [
  "Analyzing your brand...",
  "Generating designs...",
  "Placing on mockups...",
  "Almost there...",
];

const DESIGN_CONCEPTS = [
  { label: "Classic Wordmark", desc: "Clean type-based logo" },
  { label: "Graphic Mark", desc: "Icon + wordmark combo" },
  { label: "Distressed", desc: "Worn-in vintage feel" },
  { label: "Minimal Badge", desc: "Simple arc or circle" },
];

type Step = "input" | "loading" | "results" | "success";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [brandName, setBrandName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canGenerate = brandName.trim().length >= 2 && selectedStyle && selectedProduct;

  useEffect(() => {
    if (step !== "loading") return;

    let stepIndex = 0;
    let progress = 0;

    const progressInterval = setInterval(() => {
      progress += 1.5;
      setLoadingProgress(Math.min(progress, 95));
      if (progress >= 95) clearInterval(progressInterval);
    }, 80);

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < LOADING_STEPS.length) {
        setLoadingStep(stepIndex);
      } else {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
        setLoadingProgress(100);
        setTimeout(() => setStep("results"), 500);
      }
    }, 1400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [step]);

  const handleGenerate = () => {
    if (!canGenerate) return;
    setLoadingStep(0);
    setLoadingProgress(0);
    setStep("loading");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("https://formspree.io/f/xpwzgqkl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          business,
          brandName,
          style: selectedStyle,
          product: selectedProduct,
          source: "design-tool",
        }),
      });
    } catch {}
    setSubmitting(false);
    setShowEmailModal(false);
    setStep("success");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <a href="https://ghostbuilder.com" className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">GHOST BUILDER</span>
        </a>
        <a
          href="https://ghostbuilder.com/register"
          className="text-sm text-[#C5D82D] hover:text-white transition-colors font-medium"
        >
          Start Selling →
        </a>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: INPUT */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-[#C5D82D]/10 border border-[#C5D82D]/20 text-[#C5D82D] text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Free. No Credit Card. 60 Seconds.
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
                  Design Your Brand.
                  <br />
                  <span className="text-[#C5D82D]">Free. In 60 Seconds.</span>
                </h1>
                <p className="text-[#9CA3AF] text-lg max-w-md mx-auto">
                  No designers. No upfront costs. Just your idea and AI that gets it.
                </p>
              </div>

              <div className="space-y-6">
                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                    Your Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Nightfall, Apex, Raw Quarter..."
                    className="w-full bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-white text-lg placeholder:text-[#444] focus:outline-none focus:border-[#C5D82D] transition-colors"
                  />
                </div>

                {/* Style Picker */}
                <div>
                  <label className="block text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                    Brand Vibe
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStyle(s.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          selectedStyle === s.id
                            ? "border-[#C5D82D] bg-[#C5D82D]/10 text-[#C5D82D]"
                            : "border-[#222] bg-[#111] text-[#9CA3AF] hover:border-[#333] hover:text-white"
                        }`}
                      >
                        <span className="text-xl">{s.emoji}</span>
                        <span className="text-xs font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Picker */}
                <div>
                  <label className="block text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                    First Product
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRODUCTS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProduct(p.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          selectedProduct === p.id
                            ? "border-[#C5D82D] bg-[#C5D82D]/10 text-[#C5D82D]"
                            : "border-[#222] bg-[#111] text-[#9CA3AF] hover:border-[#333] hover:text-white"
                        }`}
                      >
                        <span className="text-2xl">{p.icon}</span>
                        <span className="text-xs font-medium">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <motion.button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  whileHover={canGenerate ? { scale: 1.02 } : {}}
                  whileTap={canGenerate ? { scale: 0.98 } : {}}
                  className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
                    canGenerate
                      ? "bg-[#C5D82D] text-[#070707] hover:bg-[#d4ea3a] shadow-[0_0_30px_rgba(197,216,45,0.25)]"
                      : "bg-[#1a1a1a] text-[#444] cursor-not-allowed"
                  }`}
                >
                  Create My Designs →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOADING */}
          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md text-center"
            >
              <div className="mb-8">
                <motion.div
                  className="w-20 h-20 rounded-full bg-[#C5D82D]/10 border border-[#C5D82D]/30 flex items-center justify-center mx-auto mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-3xl">✦</span>
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xl font-semibold text-white mb-2"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-[#9CA3AF] text-sm">
                  Building designs for <span className="text-white font-semibold">{brandName}</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-[#C5D82D] rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <p className="text-[#444] text-xs mt-2">{Math.round(loadingProgress)}%</p>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-[#C5D82D]/10 border border-[#C5D82D]/30 text-[#C5D82D] text-sm font-semibold px-4 py-2 rounded-full mb-4"
                >
                  ✓ Your designs are ready
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                  Your brand, ready to sell.
                </h2>
                <p className="text-[#9CA3AF]">
                  4 design concepts for{" "}
                  <span className="text-white font-semibold">{brandName}</span> -
                  {" "}{STYLES.find((s) => s.id === selectedStyle)?.label} style
                </p>
              </div>

              {/* Design Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {DESIGN_CONCEPTS.map((concept, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden group hover:border-[#C5D82D]/40 transition-all"
                  >
                    {/* Mockup placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex flex-col items-center justify-center relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Product silhouette */}
                        <div className="w-32 h-32 sm:w-44 sm:h-44 bg-[#1e1e1e] rounded-lg flex items-center justify-center border border-[#2a2a2a]">
                          <div className="text-center px-4">
                            <div className="text-[#C5D82D] font-bold text-sm sm:text-base mb-1 tracking-wider">
                              {brandName.toUpperCase()}
                            </div>
                            <div className="w-full h-0.5 bg-[#C5D82D]/40 mb-1" />
                            <div className="text-[#444] text-xs">
                              {concept.label}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 text-xs bg-[#C5D82D]/10 text-[#C5D82D] border border-[#C5D82D]/20 px-2 py-0.5 rounded-full font-medium">
                        #{i + 1}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-white">{concept.label}</p>
                      <p className="text-[#9CA3AF] text-xs mt-0.5">{concept.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => setShowEmailModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 bg-[#C5D82D] text-[#070707] rounded-xl font-bold text-lg hover:bg-[#d4ea3a] transition-all shadow-[0_0_30px_rgba(197,216,45,0.2)]"
                >
                  Download Mockups Free
                </motion.button>
                <motion.a
                  href="https://ghostbuilder.com/register"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all text-center"
                >
                  Start Selling Today →
                </motion.a>
              </div>

              <p className="text-center text-[#444] text-xs mt-4">
                No credit card required. Ships in days, not weeks.
              </p>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="text-6xl mb-6"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">You&apos;re in.</h2>
              <p className="text-[#9CA3AF] mb-8">
                Check your email for your mockups. Ready to start selling?
              </p>
              <a
                href="https://ghostbuilder.com/register"
                className="inline-block w-full py-4 bg-[#C5D82D] text-[#070707] rounded-xl font-bold text-lg hover:bg-[#d4ea3a] transition-all"
              >
                Start Selling with Ghost Builder →
              </a>
              <button
                onClick={() => {
                  setStep("input");
                  setBrandName("");
                  setSelectedStyle("");
                  setSelectedProduct("");
                  setEmail("");
                  setName("");
                  setBusiness("");
                }}
                className="mt-4 text-[#9CA3AF] text-sm hover:text-white transition-colors"
              >
                Generate another brand
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={(e) => e.target === e.currentTarget && setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-2xl font-bold mb-2">Get Your Mockups</h3>
              <p className="text-[#9CA3AF] text-sm mb-5">
                We&apos;ll send your {brandName} designs straight to your inbox. Free.
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#C5D82D] transition-colors"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#C5D82D] transition-colors"
                />
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Business name (optional)"
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl px-4 py-3 text-white placeholder:text-[#444] focus:outline-none focus:border-[#C5D82D] transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-[#C5D82D] text-[#070707] rounded-xl font-bold text-base hover:bg-[#d4ea3a] transition-all disabled:opacity-60"
                >
                  {submitting ? "Sending..." : "Send Me My Designs →"}
                </motion.button>
              </form>
              <p className="text-[#444] text-xs text-center mt-3">
                No spam. Just your designs and a link to start selling.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[#111]">
        <p className="text-[#333] text-xs">
          Powered by{" "}
          <a href="https://ghostbuilder.com" className="text-[#555] hover:text-[#C5D82D] transition-colors">
            Ghost Builder
          </a>{" "}
          - The team behind $1B+ in streetwear
        </p>
      </footer>
    </div>
  );
}
