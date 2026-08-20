import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LuPlus, LuDownload, LuChevronRight } from "react-icons/lu";

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
            className="group relative overflow-hidden bg-white hover:bg-slate-50/80 text-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-blue-200 shadow-[0_2px_10px_rgba(16,24,40,0.03)] hover:shadow-md flex items-center justify-between transition-all duration-300 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="size-12 rounded-xl bg-blue-50/80 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                <LuPlus className="size-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-sm sm:text-base text-slate-900 tracking-tight">
                  Add Funds
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-normal truncate">
                  Top up wallet balance via bank transfer
                </p>
              </div>
            </div>
            <LuChevronRight className="size-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2] ml-3" />
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
            className="group relative overflow-hidden bg-white hover:bg-slate-50/80 text-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-blue-200 shadow-[0_2px_10px_rgba(16,24,40,0.03)] hover:shadow-md flex items-center justify-between transition-all duration-300 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="size-12 rounded-xl bg-blue-50/80 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                <LuDownload className="size-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-sm sm:text-base text-slate-900 tracking-tight">
                  Withdraw Funds
                </h3>
                <p className="text-slate-500 text-xs mt-1 leading-normal truncate">
                  Transfer funds to any bank account
                </p>
              </div>
            </div>
            <LuChevronRight className="size-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 stroke-[2] ml-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default QuickActions;