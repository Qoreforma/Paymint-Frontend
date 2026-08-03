import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Landmark, ShieldCheck, CheckCircle2 } from "lucide-react";

import CreateStaticAccount from "@/components/dashboard/static-account/CreateStaticAccount";
import StaticAccountDetails from "@/components/dashboard/static-account/StaticAccountDetails";
import { useAuth } from "@/context/AuthContext";

const StaticAccount = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isVerified = Boolean(user?.bvnValidated && user?.bvnVerified);

  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-full pb-10">
      {/* Top Header / Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="relative z-10 shrink-0 flex items-center gap-2 text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full text-sm font-medium transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </button>

        <div className="text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full w-fit ml-auto md:ml-0 uppercase tracking-widest text-[11px] flex items-center gap-1.5">
          {isVerified ? (
            <>
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>ACCOUNT ACTIVE</span>
            </>
          ) : (
            <span>ONBOARDING • STEP 1 OF 2</span>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Main Step Card) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
            {isVerified ? <StaticAccountDetails /> : <CreateStaticAccount />}
          </div>
        </div>

        {/* Right Column (Benefits & Guidance Sidebar) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          
          {/* Why Dedicated Account Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-slate-900 font-display font-bold text-base flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-600" />
              Why Create a Static Account?
            </h3>

            <div className="space-y-5 text-sm">
              {/* Feature 1 */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Instant 24/7 Deposits</h4>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Direct bank transfers immediately top up your PayMint wallet balance with zero delays.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Landmark className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Personalized Bank Account</h4>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Get a dedicated permanent bank account number registered exclusively under your name.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Regulated & Secure</h4>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Identity validation powered by NIBSS under official CBN regulations and NDPR compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Security Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] opacity-10 pointer-events-none">
              <ShieldCheck className="size-32 text-white" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="size-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-blue-300">
                <ShieldCheck className="size-5" />
              </div>
              <h4 className="font-semibold text-base">Bank-Grade Encryption</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                We strictly protect your identity data. BVN verification is conducted via secure encrypted channels and is never exposed to third parties.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StaticAccount;