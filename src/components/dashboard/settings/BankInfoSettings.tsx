import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Landmark, CreditCard } from "lucide-react";

import AddNewBank from "./AddNewBank";
import { getSavedAccounts } from "@/lib/api/dashboard-apis/settingsApis";

export type TSavedBankAccount = {
  _id: string;
  __v: string;
  userId: string;
  bankCode: string;
  bank_id: string;
  accountNumber: string;
  accountName: string;
  createdAt: string;
  updatedAt: string;
  bankName: string;
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

const BankInfoSettings = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: accounts, isLoading, error } = useQuery<TSavedBankAccount[], Error>({
    queryKey: ["bank-accounts"],
    queryFn: getSavedAccounts,
  });

  if (showAddForm) {
    return (
      <div className="w-full max-w-[780px] mx-auto pb-12 pt-2">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-slate-900">Add Bank Account</h1>
            <p className="text-slate-500 text-xs mt-0.5">Link a new bank account for withdrawals</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <AddNewBank showBankInfo={() => setShowAddForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[780px] mx-auto pb-12 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/settings")}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-slate-900">Bank Info</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {accounts?.length
                ? `${accounts.length} account${accounts.length !== 1 ? "s" : ""} linked`
                : "No bank accounts linked yet"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="size-4" />
          Add Bank
        </button>
      </div>

      {/* Bank Accounts List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {isLoading && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 animate-pulse ${
                  i < 2 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="size-12 rounded-2xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded-full w-36" />
                  <div className="h-3 bg-slate-100 rounded-full w-52" />
                </div>
              </div>
            ))}
          </>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="size-12 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center mb-3">
              <Landmark className="size-6" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Failed to load accounts</p>
            <p className="text-xs text-slate-400 mt-1">Please refresh the page to try again</p>
          </div>
        )}

        {!isLoading && !error && (!accounts || accounts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-14 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4 border border-slate-100">
              <CreditCard className="size-7" />
            </div>
            <h3 className="font-display font-bold text-slate-900 text-base mb-1">No bank accounts yet</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Add a bank account so you can withdraw funds from your PayMint wallet.
            </p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="size-4" />
              Add your first account
            </button>
          </div>
        )}

        {accounts && accounts.length > 0 &&
          accounts.map((account, idx) => {
            const initials = account.accountName
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <div
                key={account._id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  idx < accounts.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div
                  className={`size-12 rounded-2xl font-bold text-sm flex items-center justify-center shrink-0 ${colorClass}`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-slate-900 truncate">
                    {account.accountName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{account.bankName}</span>
                    <span className="size-1 rounded-full bg-slate-300 shrink-0" />
                    <span className="text-xs text-slate-500 font-mono">{account.accountNumber}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {accounts && accounts.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-blue-400 hover:text-blue-600 text-slate-500 text-sm font-medium py-3.5 rounded-2xl transition-all cursor-pointer"
        >
          <Plus className="size-4" />
          Add another account
        </button>
      )}
    </div>
  );
};

export default BankInfoSettings;