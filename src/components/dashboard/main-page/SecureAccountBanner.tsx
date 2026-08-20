import { motion } from "framer-motion";
import { X, ChevronRight, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import shield3d from "@/assets/dashboard/shield-3d.png";

const SecureAccountBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // If user has already activated their transaction PIN or dismissed the banner, don't show it
  const hasPin = Boolean(user?.pinActivatedAt);
  if (hasPin || !isVisible) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 md:mt-8 mb-4 w-full relative flex rounded-2xl bg-white shadow-sm border border-slate-200/90 overflow-hidden group"
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        aria-label="Close banner"
      >
        <X className="size-4" />
      </button>

      {/* Blue graphic/gradient section */}
      <div className="w-[110px] sm:w-[130px] bg-gradient-to-br from-blue-500 to-blue-700 relative flex items-center justify-center overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay" />
        {/* 3D Shield Graphic */}
        <div className="absolute inset-0 flex items-center justify-center opacity-90 z-10 w-full h-full p-2">
          <img
            src={shield3d}
            alt="Security Shield"
            className="w-full h-full object-contain mix-blend-screen drop-shadow-md"
          />
        </div>
        {/* Abstract background shapes */}
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/20 rounded-full blur-xl" />
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-md" />
      </div>

      {/* Content section */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="size-4 text-blue-600 shrink-0" />
              <h2 className="text-slate-900 font-display font-semibold text-base md:text-lg tracking-tight">
                Set your transaction PIN
              </h2>
            </div>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-md">
              Set up a 4-digit transaction PIN to authorize payments and withdrawals securely.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-white bg-[#1C3FB5] w-fit px-5 py-2.5 rounded-full hover:bg-blue-800 transition-colors shadow-sm tracking-wide shrink-0 cursor-pointer active:scale-95"
          >
            <span>Set PIN Now</span>
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default SecureAccountBanner;
