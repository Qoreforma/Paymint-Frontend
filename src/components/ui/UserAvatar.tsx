import React from "react";
import { User } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    user: User | null | undefined;
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className }) => {
    if (!user) {
        return (
            <div className={cn("size-full rounded-full bg-slate-200 animate-pulse shrink-0 aspect-square", className)} />
        );
    }

    if (user.avatar) {
        return (
            <img 
                src={user.avatar} 
                alt={`${user.firstname} ${user.lastname}`} 
                className={cn("size-full rounded-full object-cover shrink-0 aspect-square", className)} 
            />
        );
    }

    const getInitials = () => {
        const first = user.firstname ? user.firstname[0] : "";
        const last = user.lastname ? user.lastname[0] : "";
        return (first + last).toUpperCase() || "?";
    };

    return (
        <div 
            className={cn(
                "size-full rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm select-none border border-blue-200 shrink-0 aspect-square", 
                className
            )}
            title={`${user.firstname} ${user.lastname}`}
        >
            {getInitials()}
        </div>
    );
};

export default UserAvatar;
