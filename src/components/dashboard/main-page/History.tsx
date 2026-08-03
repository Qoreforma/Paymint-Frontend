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
        queryFn: () => getTxnHistory({per_page: 6}),
    })

  return (
    <section className="mt-7 w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-800 font-display font-medium text-base">Recent Transactions</h2>
            <Link className="flex items-center gap-1 text-blue-600 text-sm hover:underline" to="/dashboard/history">
                <span className="font-medium">See all</span>
                <ChevronRight className="size-4" strokeWidth={2.5} />
            </Link>
        </div>
        <div className="flex flex-col gap-2">
          {
            fetchingHistory ? Array.from({length: 6}).map((_, i) => (
              <div key={i} className="flex justify-between items-center animate-pulse py-2">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-slate-100 rounded-full"></div>
                  <div className="flex flex-col">
                    <div className="w-24 h-4 bg-slate-100 rounded mb-1"></div>
                    <div className="w-16 h-3 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-4 bg-slate-100 rounded"></div>
              </div>
            )) : (
              txnHistoryData && txnHistoryData.data.length ? txnHistoryData.data.map((txn) => (
              <TransactionHistoryCard key={txn.id} transaction={txn} />
            )) : <EmptyState className="h-[200px]" text="No transactions yet" />
              )
          }
        </div>
    </section>
  )
}

export default TransactionHistory