import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const DashboardStats = () => {
  return (
    <section className="mt-6 flex flex-col md:flex-row gap-4 w-full">
        {/* Total Spent Card */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden relative">
            <div className="flex flex-col h-full relative z-10">
                <h3 className="text-slate-800 font-display font-medium text-sm">Total Spent</h3>
                <p className="text-slate-500 text-[11px] mb-4">This Month</p>
                <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold font-mono tracking-tight tabular-nums text-slate-800">
                        ₦1,243.50
                    </p>
                    <div className="w-[90px] h-[40px]">
                       <img 
                          src="/src/assets/dashboard/trend-down.png" 
                          alt="" 
                          className="w-full h-full object-contain object-right"
                        />
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-6">
                    <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit">
                        <ArrowDownRight className="size-3" strokeWidth={3} />
                        <span>8.5%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
            </div>
        </div>

        {/* Successful Transactions Card */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm overflow-hidden relative">
            <div className="flex flex-col h-full relative z-10">
                <h3 className="text-slate-800 font-display font-medium text-sm">Successful Transactions</h3>
                <p className="text-slate-500 text-[11px] mb-4">This Month</p>
                <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold font-mono tracking-tight tabular-nums text-slate-800">
                        24
                    </p>
                    <div className="w-[90px] h-[40px]">
                       <img 
                          src="/src/assets/dashboard/trend-up.png" 
                          alt="" 
                          className="w-full h-full object-contain object-right"
                        />
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-6">
                    <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit">
                        <ArrowUpRight className="size-3" strokeWidth={3} />
                        <span>12%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
            </div>
        </div>
    </section>
  )
}

export default DashboardStats;
