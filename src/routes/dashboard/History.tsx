import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { isToday, isYesterday } from "date-fns";
import {
  Search,
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import TransactionHistoryCard from "@/components/dashboard/main-page/TransactionHistoryCard";
import {
  getTxnHistory,
  ITEMS_PER_PAGE,
  Transaction,
} from "@/lib/api/dashboard-apis/txnHistoryApis";
import { formatAmount } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  "": "All Types",
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
  { label: "Pending", value: "pending" },
  { label: "Successful", value: "success" },
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

// ─── Main Component ────────────────────────────────────────────────────────────

const History = () => {
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

  const grouped = useMemo(() => {
    const groups: { dateGroup: string; transactions: Transaction[] }[] = [];
    const map: Record<string, Transaction[]> = {};

    filtered.forEach((txn) => {
      try {
        const d = new Date(txn.createdAt);
        const isTod = isToday(d);
        const isYest = isYesterday(d);
        const datePart = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const label = isTod
          ? `Today, ${datePart}`
          : isYest
          ? `Yesterday, ${datePart}`
          : datePart;

        if (!map[label]) {
          map[label] = [];
          groups.push({ dateGroup: label, transactions: map[label] });
        }
        map[label].push(txn);
      } catch {
        const fallback = "Earlier";
        if (!map[fallback]) {
          map[fallback] = [];
          groups.push({ dateGroup: fallback, transactions: map[fallback] });
        }
        map[fallback].push(txn);
      }
    });

    return groups;
  }, [filtered]);

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
    <div className="w-full max-w-[1200px] mx-auto pb-12 font-body">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pt-1">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 tracking-tight">
            Transactions
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
          className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-fit shrink-0"
        >
          <Download className="size-4" />
          Export CSV
        </button>
      </div>

      {/* ── Status Filter Pills (Mobile App Style) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-4">
        {STATUS_FILTERS.map((f) => {
          const isActive = (status || "") === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => updateParam("status", f.value)}
              className={`rounded-full px-5 sm:px-6 py-2 text-sm font-semibold transition-all cursor-pointer border shrink-0 ${
                isActive
                  ? "border-[#1241C9] text-[#1241C9] bg-blue-50/70 shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Search + Advanced Filters ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs mb-5">
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

        {/* Quick Filters: Type */}
        <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="size-3" />
            Type:
          </span>
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

      {/* ── Content Area (Grouped by Date) ── */}
      {isLoading ? (
        <LoadingState />
      ) : !filtered.length ? (
        <EmptyState hasFilters={hasFilters || !!search} onClear={clearFilters} />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.dateGroup} className="space-y-2">
              {/* Date Header */}
              <h2 className="text-xs font-semibold text-slate-400 mt-5 mb-2 pl-1">
                {group.dateGroup}
              </h2>

              {/* Transaction List Card matching mobile app */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-3 sm:p-4 shadow-xs divide-y divide-slate-100">
                {group.transactions.map((txn) => (
                  <TransactionHistoryCard key={txn.id} transaction={txn} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 bg-white rounded-3xl border border-slate-200/80 px-5 py-4 shadow-xs">
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
    <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs divide-y divide-slate-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3.5 px-2 py-3.5 animate-pulse">
          <div className="size-11 sm:size-12 rounded-full bg-slate-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-slate-100 rounded-md w-40" />
            <div className="h-3 bg-slate-100 rounded-md w-28" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-4 bg-slate-100 rounded-md w-20 ml-auto" />
            <div className="h-3 bg-slate-100 rounded-md w-14 ml-auto" />
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