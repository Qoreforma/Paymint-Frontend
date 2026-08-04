import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Filter,
  TrendingDown,
  TrendingUp,
  Activity,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  getTxnHistory,
  ITEMS_PER_PAGE,
  Transaction,
} from "@/lib/api/dashboard-apis/txnHistoryApis";
import { groupTransactionsByDate, formatAmount } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  "": "All",
  wallet_transfer: "Transfers",
  wallet_fund: "Deposits",
  bank_transfer: "Withdrawals",
  airtime: "Airtime",
  data: "Data",
  cable: "Cable TV",
  electricity: "Electricity",
  betting: "Betting",
};

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Success", value: "success" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

function getRecipient(txn: Transaction): string {
  const m = txn.metadata || {};
  const bankStr =
    m.bankName && m.accountNumber ? `${m.accountNumber} / ${m.bankName}` : null;
  return (
    m.recipientName ||
    m.senderUsername ||
    bankStr ||
    m.phone ||
    m.customerId ||
    m.meterNumber ||
    m.smartCardNumber ||
    m.profileId ||
    m.productName ||
    m.serviceName ||
    ""
  );
}

function getPurposeLabel(txn: Transaction): string {
  const p = txn.purpose || txn.type || "";
  return p.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  if (s === "success")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
        <CheckCircle2 className="size-3" />
        Success
      </span>
    );
  if (s === "pending" || s === "processing")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
        <Clock className="size-3 animate-pulse" />
        Pending
      </span>
    );
  if (s === "reversed")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
        <RotateCcw className="size-3" />
        Reversed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70">
      <XCircle className="size-3" />
      Failed
    </span>
  );
}

function TxnIcon({ txn }: { txn: Transaction }) {
  const logo = txn.metadata?.logo;
  if (logo)
    return (
      <img src={logo} alt="" className="size-full rounded-2xl object-cover" />
    );

  const dir = txn.direction;
  const purpose = txn.purpose || "";

  if (purpose === "deposit" || txn.type === "wallet_fund" || purpose === "wallet_fund") {
    return (
      <div className="size-full rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <ArrowDownLeft className="size-5 stroke-[2.5]" />
      </div>
    );
  }
  if (purpose === "bank_transfer") {
    return (
      <div className="size-full rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
        <ArrowUpRight className="size-5 stroke-[2.5]" />
      </div>
    );
  }
  if (purpose === "wallet_to_wallet_transfer") {
    return (
      <div className="size-full rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
        <ArrowLeftRight className="size-5 stroke-[2.5]" />
      </div>
    );
  }
  if (dir === "CREDIT") {
    return (
      <div className="size-full rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        <ArrowDownLeft className="size-5 stroke-[2.5]" />
      </div>
    );
  }
  return (
    <div className="size-full rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
      <ArrowUpRight className="size-5 stroke-[2.5]" />
    </div>
  );
}

function AmountDisplay({ txn }: { txn: Transaction }) {
  const isCredit = txn.direction === "CREDIT";
  const currSymbol = txn.metadata?.country?.currencySymbol;
  const formatted = currSymbol
    ? `${currSymbol}${txn.amount}`
    : formatAmount(txn.amount);
  const isSuccess = (txn.status || "").toLowerCase() === "success";

  return (
    <span
      className={`font-display font-bold text-sm tabular-nums ${
        !isSuccess
          ? "text-slate-400 line-through"
          : isCredit
          ? "text-emerald-600"
          : "text-slate-900"
      }`}
    >
      {isSuccess && (isCredit ? "+" : "-")}
      {formatted}
    </span>
  );
}

// ─── Summary Stats Card ────────────────────────────────────────────────────────

function SummaryStats({ transactions }: { transactions: Transaction[] }) {
  const stats = useMemo(() => {
    const total = transactions.length;
    const success = transactions.filter(
      (t) => (t.status || "").toLowerCase() === "success"
    ).length;
    const pending = transactions.filter(
      (t) =>
        (t.status || "").toLowerCase() === "pending" ||
        (t.status || "").toLowerCase() === "processing"
    ).length;
    const totalIn = transactions
      .filter(
        (t) =>
          t.direction === "CREDIT" &&
          (t.status || "").toLowerCase() === "success"
      )
      .reduce((s, t) => s + (t.amount || 0), 0);
    const totalOut = transactions
      .filter(
        (t) =>
          t.direction === "DEBIT" &&
          (t.status || "").toLowerCase() === "success"
      )
      .reduce((s, t) => s + (t.amount || 0), 0);
    return { total, success, pending, totalIn, totalOut };
  }, [transactions]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        {
          label: "Total",
          value: stats.total,
          sub: "Transactions",
          icon: <Activity className="size-4" />,
          color: "bg-slate-50 text-slate-600 border-slate-200",
        },
        {
          label: "Successful",
          value: stats.success,
          sub: "Completed",
          icon: <CheckCircle2 className="size-4" />,
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        },
        {
          label: "Money In",
          value: formatAmount(stats.totalIn),
          sub: "Credits",
          icon: <TrendingDown className="size-4" />,
          color: "bg-blue-50 text-blue-600 border-blue-200",
        },
        {
          label: "Money Out",
          value: formatAmount(stats.totalOut),
          sub: "Debits",
          icon: <TrendingUp className="size-4" />,
          color: "bg-rose-50 text-rose-600 border-rose-200",
        },
      ].map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col gap-2 shadow-xs"
        >
          <div
            className={`size-8 rounded-xl border flex items-center justify-center ${s.color}`}
          >
            {s.icon}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className="font-display font-bold text-slate-900 text-base leading-tight mt-0.5 truncate">
              {s.value}
            </p>
            <p className="text-[10px] text-slate-400">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const History = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");

  const page = parseInt(searchParams.get("page") || "1");
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    setSearchParams(next);
  };

  const { data: txnHistory, isLoading } = useQuery({
    queryKey: [
      "transaction-history",
      page,
      status,
      startDate,
      endDate,
      type,
    ],
    queryFn: () =>
      getTxnHistory({ page, per_page: ITEMS_PER_PAGE, status, startDate, endDate, type }),
  });

  const totalPages = Math.ceil(
    (txnHistory?.pagination.total || 0) / ITEMS_PER_PAGE
  );

  // Client-side search filter
  const filtered = useMemo(() => {
    const data = txnHistory?.data || [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (t) =>
        getPurposeLabel(t).toLowerCase().includes(q) ||
        getRecipient(t).toLowerCase().includes(q) ||
        t.reference?.toLowerCase().includes(q) ||
        (t.status || "").toLowerCase().includes(q)
    );
  }, [txnHistory?.data, search]);

  const grouped = useMemo(() => groupTransactionsByDate(filtered), [filtered]);

  const exportToCsv = () => {
    const rows = txnHistory?.data || [];
    if (!rows.length) return;
    const headers = ["Reference", "Description", "Recipient", "Direction", "Amount", "Status", "Date"];
    const body = rows.map((t) => [
      t.reference,
      getPurposeLabel(t),
      getRecipient(t) || "-",
      t.direction,
      formatAmount(t.amount),
      t.status,
      new Date(t.createdAt).toLocaleString(),
    ]);
    const csv =
      "data:text/csv;charset=utf-8,\uFEFF" +
      headers.join(",") +
      "\n" +
      body.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = "transactions.csv";
    a.click();
  };

  const hasFilters = Boolean(type || status || startDate || endDate);
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearch("");
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-1">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Transaction History
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {txnHistory?.pagination.total
              ? `${txnHistory.pagination.total.toLocaleString()} transactions on this account`
              : "Browse your complete payment history"}
          </p>
        </div>

        <button
          type="button"
          onClick={exportToCsv}
          disabled={!txnHistory?.data?.length}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-fit shrink-0"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      {/* ── Summary Stats ── */}
      {!isLoading && txnHistory?.data?.length ? (
        <SummaryStats transactions={txnHistory.data} />
      ) : null}

      {/* ── Search + Filters ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description, recipient, or reference…"
              className="w-full pl-10 pr-4 h-10 border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white outline-none transition-all"
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

          {/* Date Range */}
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="date"
              value={startDate}
              onChange={(e) => updateParam("startDate", e.target.value)}
              className="h-10 border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 text-sm text-slate-700 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer"
            />
            <span className="text-slate-400 text-xs shrink-0">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => updateParam("endDate", e.target.value)}
              className="h-10 border border-slate-200 hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 text-sm text-slate-700 bg-slate-50 focus:bg-white outline-none transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Filters: Status */}
        <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="size-3" />
            Status
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => updateParam("status", f.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                status === f.value
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="text-slate-200 text-sm mx-1 shrink-0">|</span>

          {/* Quick Filters: Type */}
          <span className="text-xs text-slate-400 font-medium shrink-0">Type</span>
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(TYPE_LABELS).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => updateParam("type", val)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                  type === val
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors cursor-pointer"
            >
              <X className="size-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Content Area ── */}
      {isLoading ? (
        <LoadingState />
      ) : !filtered.length ? (
        <EmptyState hasFilters={hasFilters || !!search} onClear={clearFilters} />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.dateGroup}>
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {group.dateGroup}
                </h2>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] text-slate-400 font-medium">
                  {group.transactions.length} transactions
                </span>
              </div>

              {/* Transaction Rows */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
                {group.transactions.map((txn, idx) => {
                  const recipient = getRecipient(txn);
                  const label = getPurposeLabel(txn);
                  const time = new Date(txn.createdAt).toLocaleTimeString(
                    "en-US",
                    { hour: "2-digit", minute: "2-digit", hour12: true }
                  );

                  return (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.3 }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/history/${txn.reference}`)
                        }
                        className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50/80 transition-colors text-left group cursor-pointer"
                      >
                        {/* Icon */}
                        <div className="size-11 rounded-2xl shrink-0 overflow-hidden">
                          <TxnIcon txn={txn} />
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-display font-semibold text-sm text-slate-900 truncate">
                              {label}
                            </span>
                            <StatusBadge status={txn.status} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {recipient
                              ? `${txn.direction === "CREDIT" ? "From" : "To"} ${recipient} · ${time}`
                              : time}
                          </p>
                        </div>

                        {/* Amount + Arrow */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <AmountDisplay txn={txn} />
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {txn.direction === "CREDIT" ? "Money In" : "Money Out"}
                            </p>
                          </div>
                          <ChevronRight className="size-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-white rounded-2xl border border-slate-200/80 px-5 py-4 shadow-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set("page", String(page - 1));
              setSearchParams(next);
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page{" "}
            <span className="font-bold text-slate-900">{page}</span> of{" "}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set("page", String(page + 1));
              setSearchParams(next);
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs divide-y divide-slate-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
          <div className="size-11 rounded-2xl bg-slate-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-100 rounded-full w-44" />
            <div className="h-3 bg-slate-100 rounded-full w-28" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-4 bg-slate-100 rounded-full w-20" />
            <div className="h-2.5 bg-slate-100 rounded-full w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="size-16 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4 border border-slate-100">
        <Activity className="size-8" />
      </div>
      <h3 className="font-display font-bold text-slate-900 text-lg mb-1">
        {hasFilters ? "No results found" : "No transactions yet"}
      </h3>
      <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
        {hasFilters
          ? "No transactions match your current filters or search. Try adjusting your criteria."
          : "Your transaction history will appear here once you make your first payment or transfer."}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default History;