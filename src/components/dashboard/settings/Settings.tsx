import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  ShieldCheck,
  Landmark,
  LifeBuoy,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import LogOutAccount from "./LogOutAccount";
import DeactivateAccount from "./DeactivateAccount";

const settingsSections = [
  {
    id: 1,
    title: "Account",
    subtitle: "Manage your personal profile and details",
    path: "account",
    icon: User,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    verified: true,
  },
  {
    id: 2,
    title: "Security",
    subtitle: "Password, PIN, 2FA and device management",
    path: "security",
    icon: ShieldCheck,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    verified: false,
  },
  {
    id: 3,
    title: "Bank Info",
    subtitle: "Saved bank accounts for withdrawals",
    path: "bank-info",
    icon: Landmark,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    verified: false,
  },
  {
    id: 4,
    title: "Support",
    subtitle: "Reach our 24/7 customer support team",
    path: "support",
    icon: LifeBuoy,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    verified: false,
  },
  {
    id: 5,
    title: "FAQs",
    subtitle: "Answers to frequently asked questions",
    path: "faqs",
    icon: HelpCircle,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    verified: false,
  },
];

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isPinSet = Boolean(user?.pinActivatedAt);
  const isEmailVerified = Boolean(user?.emailVerifiedAt);

  return (
    <div className="w-full max-w-[780px] mx-auto pb-12 pt-2">
      {/* Profile Hero Card */}
      <div className="bg-gradient-to-br from-[#1241C9] via-[#0D34A8] to-[#0A2980] rounded-3xl p-6 mb-6 text-white relative overflow-hidden shadow-md border border-blue-400/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          <div className="shrink-0">
            <UserAvatar user={user} className="size-16 text-2xl border-4 border-white/20 shadow-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-xl text-white tracking-tight truncate">
              {user?.firstname} {user?.lastname}
            </h1>
            <p className="text-blue-200 text-sm truncate mt-0.5">@{user?.username}</p>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              {isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/25">
                  <CheckCircle2 className="size-3" />
                  Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/25">
                  <AlertTriangle className="size-3" />
                  Email Unverified
                </span>
              )}
              {isPinSet ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/25">
                  <ShieldCheck className="size-3" />
                  PIN Active
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/settings/security")}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-300 border border-rose-400/25 cursor-pointer hover:bg-rose-400/30 transition-colors"
                >
                  <AlertTriangle className="size-3" />
                  No PIN Set
                </button>
              )}
            </div>
          </div>

          <Link
            to="account"
            className="shrink-0 size-9 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs mb-4">
        {settingsSections.map((item, idx) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group ${
              idx < settingsSections.length - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            <div className={`size-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon className="size-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-sm text-slate-900">
                  {item.title}
                </span>
                {item.id === 1 && isEmailVerified && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
            </div>

            <ChevronRight className="size-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {/* Log Out */}
        <div className="border-b border-slate-100">
          <LogOutAccount />
        </div>
        {/* Deactivate */}
        <DeactivateAccount />
      </div>
    </div>
  );
};

export default Settings;