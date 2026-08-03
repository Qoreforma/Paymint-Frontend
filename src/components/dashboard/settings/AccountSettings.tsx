import { Check, Loader } from "lucide-react";
import AccountSettingForm from "./AccountSettingForm";

import ImageAddIcon from "@/assets/dashboard/image-add.png";
import BackButton from "@/components/Authentication/BackButton";
import { useAuth } from "@/context/AuthContext";

import { useMutation } from "@tanstack/react-query";
import { updateProfileImage, uploadToImageKit } from "@/lib/api/dashboard-apis/settingsApis";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getUser } from "@/lib/api/authApi";
import UserAvatar from "@/components/ui/UserAvatar";

const AccountSettings = () => {
    const {user, setAuthData, accessToken, refreshToken} = useAuth()

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const useImageUpload = () => {
        return useMutation({
            mutationFn: uploadToImageKit
        });
    }

    const useUpdateProfileImage = () => {
        return useMutation({
            mutationFn: updateProfileImage,
            onSuccess: async () => {
                const updatedUser = await getUser();
                setAuthData(updatedUser, accessToken as string, refreshToken as string);
                toast.success("Upload successful!") 
                setPreview(null)
            }
        })
    }

    const { mutateAsync: uploadImage, isPending: uploadingImage } = useImageUpload();
    const { mutate: updateAvatar, isPending: updatingAvatar } = useUpdateProfileImage();
    const [preview, setPreview] = useState<string | null>(null);

   const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log({file})

    // preview
    setPreview(URL.createObjectURL(file));
    console.log({preview: URL.createObjectURL(file)})

    try {
      const uploaded = await uploadImage(file);
        //update avatar
        if(uploaded){
            updateAvatar({avatar: uploaded.url})
        }
    } catch (err) {
        console.error(err);
        toast.error("Upload failed!");
        setPreview(null)
    }
    }

  console.log({preview})

  return (
    <div className="md:bg-white w-full min-h-full rounded-[10px] md:border border-[#F0F2F5] md:py-10">
        <div className="flex items-center mb-10 mt-2 md:hidden fixed top-2 w-full max-w-[360px] mx-auto right-0 left-0 z-10 backdrop-blur-[2px] px-5">
            <BackButton disabled={uploadingImage || updatingAvatar} icon href="/dashboard/settings"/>
            <p className="text-[#667085] font-medium text-xl w-full text-center mr-6">Account</p>
        </div>

        <div className="mt-14 w-full max-w-[546px] mx-auto">
            <div className="w-full max-w-[491px] mx-auto flex flex-col max-md:gap-3 md:flex-row items-center justify-between">
                <div className="hidden md:block max-w-[152px]">
                    <BackButton disabled={uploadingImage || updatingAvatar} href="/dashboard/settings" className="mb-5" />
                    <h2 className="text-[#344054] font-bold">Account</h2>
                    <p className="text-[#727884] text-sm">Make changes to your account here.</p>
                </div>

                <div className="relative size-[6.25rem] md:size-[7.5rem]">
                    {preview ? <img src={preview} className="size-full rounded-full object-cover" /> : <UserAvatar user={user} className="size-full text-3xl" />}
                    <div className="size-8 md:size-[37.5px] grid place-items-center bg-blue-600 rounded-full text-white absolute right-0 bottom-0"><Check className="size-4 md:size-5" /></div>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleChange}
                    className="hidden"
                />

                <button disabled={uploadingImage || updatingAvatar} onClick={openFilePicker} className="flex items-center rounded-lg border-[1.5px] border-[#F56630] py-2 px-3 gap-2.5 text-sm font-bold text-[#F56630] cursor-pointer hover:bg-red-400/5 transition disabled:pointer-events-none disabled:opacity-60">
                    {uploadingImage || updatingAvatar ? <Loader className="szie-3 animate-spin" /> : <img src={ImageAddIcon} />}
                    <span>{uploadingImage || updatingAvatar ? "Uploading" : "Change"} Photo{uploadingImage || updatingAvatar ? "..." : ""}</span>
                </button>   
            </div>

            <AccountSettingForm />
        </div>
    </div>
  )
}

export default AccountSettings