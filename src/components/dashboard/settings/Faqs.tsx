import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Plus, Minus, Search, X } from "lucide-react";

import { getFaqs, TFaq } from "@/lib/api/dashboard-apis/faqApis";

const Faqs = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: faqs, isLoading } = useQuery<TFaq[], Error>({
    queryKey: ["faqs"],
    queryFn: getFaqs,
  });

  const filtered = (faqs || []).filter(
    (f) =>
      !search.trim() ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[780px] mx-auto pb-12 pt-2">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">FAQs</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {faqs?.length
              ? `${faqs.length} questions answered`
              : "Browse frequently asked questions"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions…"
          className="w-full pl-10 pr-10 h-11 border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-2xl text-sm text-slate-800 placeholder-slate-400 bg-white outline-none transition-all shadow-xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Loading */}
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-4 animate-pulse ${
                i < 4 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="h-3.5 bg-slate-100 rounded-full w-64" />
              <div className="size-6 rounded-full bg-slate-100 shrink-0" />
            </div>
          ))}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-14 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4 border border-slate-100">
              <HelpCircle className="size-7" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base mb-1">
              {search ? "No results found" : "No FAQs yet"}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {search
                ? "Try adjusting your search or browse all questions."
                : "Check back later — we're adding FAQs soon."}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* FAQ Items */}
        {filtered.map((faq, idx) => {
          const isOpen = faq._id === selectedId;
          return (
            <article
              key={faq._id}
              className={`${idx < filtered.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedId((prev) => (prev === faq._id ? null : faq._id))
                }
                className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div
                  className={`size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isOpen
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                  }`}
                >
                  {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-display font-semibold text-sm leading-snug ${
                      isOpen ? "text-blue-700" : "text-slate-900"
                    }`}
                  >
                    {faq.question}
                  </h3>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-slate-500 leading-relaxed mt-2 pb-1">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </article>
          );
        })}
      </div>

      {/* Footer hint */}
      {!isLoading && filtered.length > 0 && (
        <p className="text-center text-xs text-slate-400 mt-5">
          Can't find your answer?{" "}
          <button
            type="button"
            onClick={() => navigate("/dashboard/settings/support")}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Contact Support
          </button>
        </p>
      )}
    </div>
  );
};

export default Faqs;