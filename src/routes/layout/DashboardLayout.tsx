import { Navigate, Outlet } from "react-router-dom";

import ScrollToTop from "@/components/ScrollToTop";
import Sidebar from "../../components/dashboard/sidebar/Sidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { getServicesStatus } from "@/lib/api/dashboard-apis/generics";
import { fetchAirtimeProviders, fetchDataProviders } from "@/lib/api/dashboard-apis/servicesApis";
import { useWalletSocket } from "@/hooks/useWalletSocket";

const DashboardLayout = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const {accessToken, loading, user} = useAuth();
    const queryClient = useQueryClient();

    useWalletSocket();

    useEffect(() => {
        if (accessToken) {
            queryClient.prefetchQuery({ queryKey: ["servicesStatus"], queryFn: getServicesStatus });
            queryClient.prefetchQuery({ queryKey: ["airtime-providers"], queryFn: fetchAirtimeProviders });
            queryClient.prefetchQuery({ queryKey: ["data-providers"], queryFn: fetchDataProviders });
        }
    }, [accessToken]); // queryClient is stable - removed to prevent effect re-runs

    if(loading) return null; 
    if(!accessToken || !user) return <Navigate to="/auth/login" replace />

    return (
        <div className="h-screen w-full overflow-hidden flex items-start bg-[#F9FAFB]">
            <div className="hidden md:block h-full shrink-0">
                <Sidebar />
            </div>
            <main className="h-full w-full flex-1 flex flex-col min-w-0">  
                <DashboardHeader />
                <div ref={scrollRef} className="bg-[#F9FAFB] w-full flex-1 overflow-y-auto px-5 md:px-8 pt-5 pb-32">
                    <ScrollToTop containerRef={scrollRef}>
                        <Outlet />
                    </ScrollToTop>
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout