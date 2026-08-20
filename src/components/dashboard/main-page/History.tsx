import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import TransactionHistoryCard from "./TransactionHistoryCard"
import { getTxnHistory, TransactionHistoryResponse } from "@/lib/api/dashboard-apis/txnHistoryApis"
import { useQuery } from "@tanstack/react-query"
import EmptyState from "../EmptyState"

const TransactionHistory = () => {
    const {
        data: txnHistoryData,
        isLoading: fetchingHistory,
    } = useQuery<TransactionHistoryResponse, Error>({
        queryKey: ["transaction-history"],
        queryFn: () => getTxnHistory({ per_page: 7 }),
    });

  return (
    <section className="w-full bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(16,24,40,0.03)]">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-[#101828] font-display font-bold text-base md:text-lg tracking-tight">Recent Transactions</h2>
            <Link className="flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline" to="/dashboard/history">
                <span>See all</span>
                <ChevronRight className="size-4 stroke-[2.5]" />
            </Link>
        </div>
        <div className="flex flex-col divide-y divide-slate-100">
          {
            fetchingHistory ? Array.from({length: 6}).map((_, i) => (
              <div key={i} className="flex justify-between items-center animate-pulse py-3 px-1">
                <div className="flex items-center gap-3.5">
                  <div className="size-11 bg-slate-100 rounded-full"></div>
                  <div className="flex flex-col gap-1">
                    <div className="w-28 h-4 bg-slate-100 rounded-md"></div>
                    <div className="w-20 h-3 bg-slate-100 rounded-md"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="w-16 h-4 bg-slate-100 rounded-md"></div>
                  <div className="w-12 h-3 bg-slate-100 rounded-md"></div>
                </div>
              </div>
            )) : (
              txnHistoryData && txnHistoryData.data.length ? txnHistoryData.data.map((txn) => (
              <TransactionHistoryCard key={txn.id} transaction={txn} />
            )) : <EmptyState className="h-[220px]" text="No transactions yet" />
              )
          }
        </div>
    </section>
  )
}

export default TransactionHistory