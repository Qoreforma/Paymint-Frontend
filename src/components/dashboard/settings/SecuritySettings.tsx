import { useNavigate } from "react-router-dom";
import {
  Lock,
  Phone,
  Key,
  Shield,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  LoaderCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import ChangePasswordModal from "./ChangePasswordModal";
import UpdatePhoneModal from "./UpdatePhoneModal";
import ChangeTxnPinModal from "./ChangeTxnPinModal";
import { toggle2fa } from "@/lib/api/dashboard-apis/settingsApis";
import { useAuth } from "@/context/AuthContext";
import { getUser } from "@/lib/api/authApi";
import { cn } from "@/lib/utils";

const SecuritySettings = () => {
  const navigate = useNavigate();
  const { user, setAuthData, accessToken, refreshToken } = useAuth();

  const { mutate: set2fa, isPending: toggling2fa } = useMutation({
    mutationFn: toggle2fa,
    onSuccess: async (data) => {
      try {
        const updatedUser = await getUser();
        setAuthData(updatedUser, accessToken as string, refreshToken as string);
      } catch {}
      toast.success(data.message);
    },
    onError: (error: AxiosError) => {
      const errData = error.response?.data as { message?: string };
      toast.error(errData?.message || "Something went wrong");
    },
  });

  const isPinSet = Boolean(user?.pinActivatedAt);
  const isPhoneVerified = Boolean(user?.phoneVerifiedAt);
  const is2faEnabled = Boolean(user?.twofactorEnabled);

  return (
    <div className="w-full max-w-[780px] mx-auto pb-12 pt-2">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard/settings")}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">Security</h1>
          <p className="text-slate-500 text-xs mt-0.5">Manage your account security preferences</p>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            label: "Transaction PIN",
            ok: isPinSet,
            okText: "Active",
            failText: "Not Set",
          },
          {
            label: "Phone Number",
            ok: isPhoneVerified,
            okText: "Verified",
            failText: "Not Verified",
          },
          {
            label: "Two-Factor Auth",
            ok: is2faEnabled,
            okText: "Enabled",
            failText: "Disabled",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs text-center">
            <div
              className={`size-8 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                s.ok ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              {s.ok ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
            <p
              className={`text-xs font-bold mt-0.5 ${
                s.ok ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {s.ok ? s.okText : s.failText}
            </p>
          </div>
        ))}
      </div>

      {/* Security Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">

        {/* Change Password */}
        <SecurityRow
          icon={<Lock className="size-5" />}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          title="Change Password"
          subtitle="Update your account login password"
          trigger={<ChangePasswordModal />}
          isCustomTrigger
        />

        {/* Phone Number */}
        <SecurityRow
          icon={<Phone className="size-5" />}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          title={isPhoneVerified ? "Phone Number" : "Update Phone Number"}
          subtitle={
            isPhoneVerified
              ? `Linked: ${user?.phone || "Verified"}`
              : "Add a phone number to your account"
          }
          badge={isPhoneVerified ? "Verified" : undefined}
          trigger={<UpdatePhoneModal />}
          isCustomTrigger
          showDivider
        />

        {/* Transaction PIN */}
        <SecurityRow
          icon={<Key className="size-5" />}
          iconBg="bg-violet-50 text-violet-600 border-violet-100"
          title={isPinSet ? "Change Transaction PIN" : "Set Transaction PIN"}
          subtitle="4-digit PIN required to approve transactions"
          badge={isPinSet ? "Active" : "Not Set"}
          badgeVariant={isPinSet ? "success" : "warning"}
          trigger={<ChangeTxnPinModal />}
          isCustomTrigger
          showDivider
        />

        {/* 2FA Toggle */}
        <div className="flex items-center gap-4 px-5 py-4 border-t border-slate-100">
          <div className="size-10 rounded-xl border bg-indigo-50 text-indigo-600 border-indigo-100 flex items-center justify-center shrink-0">
            <Shield className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm text-slate-900">
                Two-Factor Authentication
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  is2faEnabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {is2faEnabled ? "ON" : "OFF"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Extra layer of security for your account
            </p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            disabled={toggling2fa}
            onClick={() => set2fa({ enable: !is2faEnabled })}
            className={cn(
              "relative w-11 h-6 rounded-full border-2 transition-all duration-300 shrink-0 cursor-pointer disabled:opacity-60",
              is2faEnabled
                ? "bg-emerald-500 border-emerald-500"
                : "bg-slate-200 border-slate-200"
            )}
          >
            {toggling2fa ? (
              <LoaderCircle className="animate-spin size-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            ) : (
              <div
                className={cn(
                  "absolute top-0.5 size-4 bg-white rounded-full shadow-sm transition-all duration-300",
                  is2faEnabled ? "left-5" : "left-0.5"
                )}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Security Row helper ───────────────────────────────────────────────────────
function SecurityRow({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  badgeVariant = "success",
  trigger,
  isCustomTrigger,
  showDivider,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeVariant?: "success" | "warning";
  trigger: React.ReactNode;
  isCustomTrigger?: boolean;
  showDivider?: boolean;
}) {
  if (isCustomTrigger) {
    // The trigger components (Modal wrappers) render their own button.
    // We render the row UI separately and overlay the modal trigger invisibly.
    return (
      <div className={`relative flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group ${showDivider ? "border-t border-slate-100" : ""}`}>
        <div className={`size-10 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm text-slate-900">{title}</span>
            {badge && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  badgeVariant === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <ChevronRight className="size-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        {/* Invisible overlay to capture the trigger */}
        <div className="absolute inset-0 opacity-0">{trigger}</div>
      </div>
    );
  }
  return null;
}

export default SecuritySettings;