import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Copy,
  Check,
  Plus,
  Landmark,
  ExternalLink,
  Info,
  Sparkles,
} from "lucide-react";
import { ImEyeBlocked, ImEye } from "react-icons/im";

import { getWallet } from "@/lib/api/dashboard-apis/walletApis";
import { getStaticAccount } from "@/lib/api/dashboard-apis/staticAccountApis";
import { useAuth } from "@/context/AuthContext";
import { copyToClipboard } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const BalanceCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hideBalance, setHideBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: getWallet,
  });

  const { data: staticAccountData, isLoading: isAccountLoading } = useQuery({
    queryKey: ["static-account"],
    queryFn: getStaticAccount,
    staleTime: 1000 * 60 * 5,
  });

  const rawFormatted =
    wallet && typeof wallet.balance === "number"
      ? wallet.balance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";
  const [integerPart, decimalPart] = rawFormatted.split(".");

  const hasAccount = Boolean(
    staticAccountData?.hasAccount && staticAccountData?.account?.accountNumber
  );
  const account = staticAccountData?.account;
  const accountHolderName =
    account?.accountName ||
    (user?.firstname
      ? `${user.firstname} ${user.lastname || ""}`.trim()
      : user?.username
      ? `@${user.username}`
      : "PayMint Account");

  const handleCopyAccount = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!account?.accountNumber) return;
    await copyToClipboard(account.accountNumber, "Virtual account number copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="relative w-full bg-gradient-to-br from-[#1241C9] via-[#0D34A8] to-[#0A2980] overflow-hidden rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-md text-white min-h-[175px] border border-blue-400/20">
        {/* Aesthetic background glow & shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        {/* 3D Wallet Graphic */}
        <div className="absolute right-[-10px] bottom-[-20px] h-[130%] w-[40%] max-w-[180px] hidden sm:flex items-end justify-end pointer-events-none opacity-85 z-0">
          <img
            src="/src/assets/dashboard/wallet-3d.png"
            alt=""
            className="w-full h-full object-contain object-bottom mix-blend-screen opacity-90 drop-shadow-2xl"
          />
        </div>

        {/* Top Section: Balance Header & Hide/Show */}
        <div className="relative z-10 w-full flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest font-bold text-blue-200/90">
                AVAILABLE BALANCE
              </span>
              <button
                type="button"
                className="text-blue-200 hover:text-white transition-colors cursor-pointer p-0.5"
                onClick={() => setHideBalance((prev) => !prev)}
                title={hideBalance ? "Show Balance" : "Hide Balance"}
              >
                {hideBalance ? (
                  <ImEyeBlocked className="size-3.5" />
                ) : (
                  <ImEye className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-1">
            {hideBalance ? (
              <span className="text-white font-bold text-3xl md:text-4xl tracking-widest block py-0.5">
                ••••••
              </span>
            ) : isWalletLoading ? (
              <Loader2 className="text-blue-200 animate-spin size-7 my-1" />
            ) : (
              <h2 className="text-white font-bold text-3xl md:text-4xl tracking-tight tabular-nums leading-none">
                ₦{integerPart}
                <span className="text-blue-200 text-xl md:text-2xl">
                  .{decimalPart}
                </span>
              </h2>
            )}
          </div>
        </div>

        {/* Bottom Section: Compact Low-Profile Funding Account Bar */}
        <div className="relative z-10 w-full mt-4 pt-3 border-t border-white/15">
          {isAccountLoading ? (
            <div className="flex items-center gap-2 text-xs text-blue-200 py-0.5">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Loading virtual account...</span>
            </div>
          ) : hasAccount ? (
            /* COMPACT FUNDING ACCOUNT STRIP */
            <div className="flex items-center justify-between w-full gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-6 rounded-lg bg-white/15 flex items-center justify-center text-blue-200 shrink-0">
                  <Landmark className="size-3" />
                </div>
                <div className="flex items-center gap-2 truncate text-xs">
                  <span className="font-semibold text-blue-100 uppercase tracking-wider shrink-0">
                    {account?.bankName || "PAYMINT"}
                  </span>
                  <span className="text-blue-300/60">•</span>
                  <span className="font-mono font-bold tracking-wider text-white truncate">
                    {account?.accountNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                  title="Copy Account Number"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 text-blue-200" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(true)}
                  className="flex items-center gap-1 text-blue-200 hover:text-white px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  title="View Full Account Details"
                >
                  <span>Details</span>
                  <ExternalLink className="size-3" />
                </button>
              </div>
            </div>
          ) : (
            /* NO ACCOUNT COMPACT STRIP */
            <div className="flex items-center justify-between w-full gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 transition-all">
              <div className="flex items-center gap-2 text-xs text-blue-100">
                <Sparkles className="size-3.5 text-amber-300 shrink-0" />
                <span className="truncate">No virtual bank account</span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/dashboard/static-account")}
                className="bg-white text-blue-900 hover:bg-blue-50 text-[11px] font-bold px-3 py-1 rounded-lg transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
              >
                <Plus className="size-3 stroke-[2.5]" />
                <span>Generate</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DEDICATED FULL ACCOUNT DETAILS MODAL */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[440px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
          <DialogHeader className="space-y-1 text-left">
            <div className="size-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Landmark className="size-6" />
            </div>
            <DialogTitle className="text-xl font-display font-bold text-slate-900">
              Dedicated Virtual Account
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs leading-relaxed">
              Use these bank details to transfer funds directly from any banking app or USSD code into your PayMint wallet balance.
            </DialogDescription>
          </DialogHeader>

          {/* Account Detail Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md space-y-4 my-2 border border-slate-700/60 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 pointer-events-none">
              <Landmark className="size-32 text-white" />
            </div>

            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {account?.bankName || "PAYMINT BANK"}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                NIBSS Verified
              </span>
            </div>

            <div className="relative z-10 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Account Number
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-2xl font-extrabold tracking-widest text-white">
                  {account?.accountNumber || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyAccount()}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-slate-300" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative z-10 pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Name</span>
              <span className="font-semibold text-slate-200 truncate max-w-[220px]">
                {accountHolderName}
              </span>
            </div>
          </div>

          {/* Guidance note */}
          <div className="flex items-start gap-2.5 bg-blue-50 text-blue-800 rounded-xl p-3 text-xs leading-relaxed">
            <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Transfers to this static account number are processed 24/7 and automatically credit your PayMint wallet instantly with zero delays.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleCopyAccount()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Copy className="size-4" />
              <span>Copy Account Number</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BalanceCard;