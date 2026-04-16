"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// SVG Icon components
const Icon = ({ d, size = 24 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const StyleIcons: Record<string, React.ReactNode> = {
  streetwear: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
    </svg>
  ),
  vintage: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  ),
  minimal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  bold: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  luxury: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  sports: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6-6 6 6" />
      <path d="M12 3v12" />
      <path d="M3 18h18" />
      <path d="M6 21h12" />
    </svg>
  ),
};

const ProductIcons: Record<string, React.ReactNode> = {
  tee: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 2H4a1 1 0 0 0-1 1v1.5a5 5 0 0 0 3 4.5V21a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a5 5 0 0 0 3-4.5V3a1 1 0 0 0-1-1h-2.5" />
      <path d="M9 2a3 3 0 0 0 6 0" />
    </svg>
  ),
  hoodie: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 2H4a1 1 0 0 0-1 1v3a6 6 0 0 0 2 4.5V21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10.5A6 6 0 0 0 21 6V3a1 1 0 0 0-1-1h-2.5" />
      <path d="M9 2a3 3 0 0 0 6 0" />
      <path d="M9 22v-4a3 3 0 0 1 6 0v4" />
    </svg>
  ),
  crew: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 2H4a1 1 0 0 0-1 1v2a5 5 0 0 0 3 4.5V21a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5A5 5 0 0 0 21 5V3a1 1 0 0 0-1-1h-2.5" />
      <path d="M10 2a2 2 0 0 0 4 0" />
    </svg>
  ),
  cap: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h18" />
      <path d="M4 14c0-5 3.5-9 8-9s8 4 8 9" />
      <path d="M2 14c0 2 1.5 4 4 4h12c2.5 0 4-2 4-4" />
      <path d="M20 14l2 1" />
    </svg>
  ),
};

const STYLES = [
  { id: "streetwear", label: "Streetwear" },
  { id: "vintage", label: "Vintage" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold/Graphic" },
  { id: "luxury", label: "Luxury" },
  { id: "sports", label: "Sports" },
];

const PRODUCTS = [
  { id: "tee", label: "T-Shirt" },
  { id: "hoodie", label: "Hoodie" },
  { id: "crew", label: "Crew Neck" },
  { id: "cap", label: "Cap" },
];

const LOADING_STEPS = [
  "Analyzing your brand...",
  "Generating designs...",
  "Creating variations...",
  "Placing on mockups...",
  "Almost there...",
];

interface DesignResult {
  name: string;
  image: string | null;
  error: string | null;
}

type Step = "input" | "loading" | "results" | "success";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [brandName, setBrandName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [designs, setDesigns] = useState<DesignResult[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate =
    brandName.trim().length >= 2 && selectedStyle && selectedProduct;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;
    setLoadingStep(0);
    setLoadingProgress(0);
    setGenError(null);
    setDesigns([]);
    setStep("loading");

    // Start loading animation
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < LOADING_STEPS.length) {
        setLoadingStep(stepIdx);
      }
    }, 3000);

    let prog = 0;
    const progInterval = setInterval(() => {
      prog += 0.5;
      setLoadingProgress(Math.min(prog, 90));
    }, 200);

    try {
      // Build request body with optional logo
      const requestBody: Record<string, string> = {
        brandName: brandName.trim(),
        style: selectedStyle,
        product: selectedProduct,
      };

      // If logo is uploaded, convert to base64 and include it
      if (logoFile) {
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Strip the data:image/xxx;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(logoFile);
        });
        requestBody.logoBase64 = logoBase64;
        requestBody.logoMimeType = logoFile.type || 'image/png';
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      clearInterval(stepInterval);
      clearInterval(progInterval);

      if (!res.ok) {
        throw new Error(`Generation failed (${res.status})`);
      }

      const data = await res.json();
      const results: DesignResult[] = data.designs || [];

      // Check if we got any images
      const hasImages = results.some((d: DesignResult) => d.image);
      if (!hasImages) {
        throw new Error("No designs were generated. Please try again.");
      }

      setDesigns(results);
      setLoadingProgress(100);
      setTimeout(() => setStep("results"), 400);
    } catch (err) {
      clearInterval(stepInterval);
      clearInterval(progInterval);
      setGenError(err instanceof Error ? err.message : "Generation failed");
      setStep("input");
    }
  }, [brandName, selectedStyle, selectedProduct, canGenerate]);

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
          hasLogo: !!logoFile,
          source: "design-tool",
          designCount: designs.filter((d) => d.image).length,
        }),
      });
    } catch {}
    setSubmitting(false);
    setShowEmailModal(false);
    setStep("success");
  };

  const downloadDesign = (dataUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${brandName.toLowerCase().replace(/\s+/g, "-")}-design-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <a href="https://ghostbuilder.com" className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">
            GHOST BUILDER
          </span>
        </a>
        <a
          href="https://ghostbuilder.com/register"
          className="text-sm text-[#C5D82D] hover:text-white transition-colors font-medium"
        >
          Start Selling →
        </a>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-16">
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
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-[#C5D82D]/10 border border-[#C5D82D]/20 text-[#C5D82D] text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                  Free. No Credit Card. 60 Seconds.
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
                  Design Your Brand.
                </h1>

              </div>

              {/* Error message */}
              {genError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6 text-center"
                >
                  {genError}. Try again or adjust your inputs.
                </motion.div>
              )}

              <div className="space-y-10">
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
                    maxLength={40}
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                    Logo / Image{" "}
                    <span className="text-[#444] normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  {logoPreview ? (
                    <div className="flex items-center gap-4 bg-[#111] border border-[#222] rounded-xl p-3">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-14 h-14 object-contain rounded-lg bg-[#0a0a0a]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {logoFile?.name}
                        </p>
                        <p className="text-xs text-[#444]">
                          {logoFile
                            ? `${(logoFile.size / 1024).toFixed(0)}KB`
                            : ""}
                        </p>
                      </div>
                      <button
                        onClick={removeLogo}
                        className="text-[#666] hover:text-red-400 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('border-[#C5D82D]'); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('border-[#C5D82D]'); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-[#C5D82D]');
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          setLogoFile(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-[#111] border border-dashed border-[#333] rounded-xl px-4 py-8 text-center hover:border-[#C5D82D]/50 transition-colors group"
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-[#444] group-hover:text-[#666]">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-[#666] group-hover:text-[#999] text-sm">
                        Drop your logo here or click to upload
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
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
                        <span className="text-xl">{StyleIcons[s.id]}</span>
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
                        <span className="text-2xl">{ProductIcons[p.id]}</span>
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

                <p className="text-center text-[#444] text-xs mt-2">
                  Powered by AI. Designs generated in under 60 seconds.
                </p>
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
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
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
                  Building designs for{" "}
                  <span className="text-white font-semibold">{brandName}</span>
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
              <p className="text-[#444] text-xs mt-2">
                {Math.round(loadingProgress)}%
              </p>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-4xl"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-[#C5D82D]/10 border border-[#C5D82D]/30 text-[#C5D82D] text-sm font-semibold px-4 py-2 rounded-full mb-4"
                >
                  ✓ {designs.filter((d) => d.image).length} designs generated
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                  Your brand, ready to sell.
                </h2>
                <p className="text-[#9CA3AF]">
                  AI-generated designs for{" "}
                  <span className="text-white font-semibold">{brandName}</span>{" "}
                  -{" "}
                  {STYLES.find((s) => s.id === selectedStyle)?.label} on{" "}
                  {PRODUCTS.find((p) => p.id === selectedProduct)?.label}
                </p>
              </div>

              {/* Design Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {designs.map((design, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden group hover:border-[#C5D82D]/40 transition-all"
                  >
                    {/* Design image or placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] flex items-center justify-center relative overflow-hidden">
                      {design.image ? (
                        <img
                          src={design.image}
                          alt={`${brandName} - ${design.name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center px-4">
                          <div className="text-[#333] text-sm mb-2">
                            Generation failed
                          </div>
                          <div className="text-[#222] text-xs">
                            {design.error || "Try again"}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 text-xs bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-medium">
                        #{i + 1} {design.name}
                      </div>
                      {design.image && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() =>
                              design.image && downloadDesign(design.image, i)
                            }
                            className="bg-white/90 text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-white">
                        {design.name}
                      </p>
                      <p className="text-[#9CA3AF] text-xs mt-0.5">
                        {brandName} - {STYLES.find((s) => s.id === selectedStyle)?.label}
                      </p>
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
                  Download All Free
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

              {/* Regenerate */}
              <div className="text-center mt-4">
                <button
                  onClick={handleGenerate}
                  className="text-[#9CA3AF] text-sm hover:text-[#C5D82D] transition-colors"
                >
                  Not happy? Generate new designs →
                </button>
              </div>

              <p className="text-center text-[#333] text-xs mt-3">
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
                Your {brandName} designs are ready. Let&apos;s get you selling.
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
                  setDesigns([]);
                  setLogoFile(null);
                  setLogoPreview(null);
                }}
                className="mt-4 text-[#9CA3AF] text-sm hover:text-white transition-colors block mx-auto"
              >
                Design another brand
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
            onClick={(e) =>
              e.target === e.currentTarget && setShowEmailModal(false)
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-2xl font-bold mb-2">Get Your Designs</h3>
              <p className="text-[#9CA3AF] text-sm mb-5">
                Enter your email and we&apos;ll send your {brandName} designs.
                Free. No spam.
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
                No spam. Just your designs and how to start selling.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[#111]">
        <p className="text-[#333] text-xs">
          Powered by{" "}
          <a
            href="https://ghostbuilder.com"
            className="text-[#555] hover:text-[#C5D82D] transition-colors"
          >
            Ghost Builder
          </a>{" "}
          - The team behind $1B+ in streetwear
        </p>
      </footer>
    </div>
  );
}
