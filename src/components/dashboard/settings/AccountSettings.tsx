import { useRef, useState } from "react";
import { Camera, Loader2, MapPin, Mail, User, AtSign } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { updateProfileImage, uploadToImageKit } from "@/lib/api/dashboard-apis/settingsApis";
import { getUser } from "@/lib/api/authApi";
import UserAvatar from "@/components/ui/UserAvatar";
import AccountSettingForm from "./AccountSettingForm";

const AccountSettings = () => {
  const { user, setAuthData, accessToken, refreshToken } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { mutateAsync: uploadImage, isPending: uploadingImage } = useMutation({
    mutationFn: uploadToImageKit,
  });

  const { mutate: updateAvatar, isPending: updatingAvatar } = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: async () => {
      const updatedUser = await getUser();
      setAuthData(updatedUser, accessToken as string, refreshToken as string);
      toast.success("Profile photo updated!");
      setPreview(null);
    },
  });

  const isUploading = uploadingImage || updatingAvatar;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    try {
      const uploaded = await uploadImage(file);
      if (uploaded) updateAvatar({ avatar: uploaded.url });
    } catch {
      toast.error("Photo upload failed.");
      setPreview(null);
    }
  };

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
          <h1 className="font-display font-bold text-xl text-slate-900">Account Settings</h1>
          <p className="text-slate-500 text-xs mt-0.5">Update your profile and personal information</p>
        </div>
      </div>

      {/* Profile Photo Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 mb-4 shadow-xs">
        <h2 className="font-display font-semibold text-sm text-slate-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {preview ? (
              <img src={preview} className="size-20 rounded-2xl object-cover shadow-sm" alt="Preview" />
            ) : (
              <UserAvatar user={user} className="size-20 text-2xl rounded-2xl" />
            )}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 size-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Camera className="size-4" />
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">
              {user?.firstname} {user?.lastname}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">@{user?.username}</p>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Change photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Read-only identity summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 mb-4 shadow-xs">
        <h2 className="font-display font-semibold text-sm text-slate-900 mb-4">Identity Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: User, label: "First Name", value: user?.firstname },
            { icon: User, label: "Last Name", value: user?.lastname },
            { icon: Mail, label: "Email Address", value: user?.email, badge: user?.emailVerifiedAt ? "Verified" : "Unverified" },
            { icon: AtSign, label: "Username", value: `@${user?.username}` },
            { icon: MapPin, label: "Country", value: user?.country || "Not set" },
            { icon: MapPin, label: "State", value: user?.state || "Not set" },
          ].map(({ icon: Icon, label, value, badge }) => (
            <div key={label} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3.5 py-3 border border-slate-100">
              <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm font-semibold text-slate-800 truncate">{value || "—"}</p>
                  {badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="font-display font-semibold text-sm text-slate-900 mb-1">Edit Information</h2>
        <p className="text-xs text-slate-500 mb-4">Update your username, country, and state. First name, last name, and email cannot be changed.</p>
        <AccountSettingForm />
      </div>
    </div>
  );
};

export default AccountSettings;