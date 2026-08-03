import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuPlus, LuDownload, LuArrowRight } from "react-icons/lu";

const QuickActions = () => {
  return (
    <section className="mt-5 z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Add Funds Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            to="/dashboard/add-funds"
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-5 border border-blue-500/30 shadow-sm flex items-center justify-between transition-all duration-300 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                <LuPlus className="size-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base md:text-lg tracking-tight">
                  Add Funds
                </h3>
                <p className="text-blue-100 text-xs mt-0.5">
                  Top up wallet balance via bank transfer
                </p>
              </div>
            </div>
            <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0">
              <LuArrowRight className="size-4" />
            </div>
          </Link>
        </motion.div>

        {/* Withdraw Funds Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            to="/dashboard/withdraw-funds"
            className="group relative overflow-hidden bg-white hover:bg-slate-50 text-slate-800 rounded-2xl p-5 border border-slate-200/90 hover:border-blue-300 shadow-sm flex items-center justify-between transition-all duration-300 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <LuDownload className="size-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base md:text-lg text-slate-900 tracking-tight">
                  Withdraw Funds
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Transfer funds to any bank account
                </p>
              </div>
            </div>
            <div className="size-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0">
              <LuArrowRight className="size-4" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default QuickActions;