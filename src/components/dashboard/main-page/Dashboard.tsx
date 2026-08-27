import { useAuth } from "@/context/AuthContext"
import BalanceCard from "./BalanceCard"
import TransactionHistory from "./History"
import SecureAccountBanner from "./SecureAccountBanner"
import QuickActions from "./QuickActions"
import ServicesList from "./ServicesList"
import SpinTicketNotice from "./SpinTicketNotice"
import { getTimeOfDay } from "@/lib/utils"
import { useState } from "react"
import AllServicesModal from "./AllServicesModal"

const Dashboard = () => {
  const {user} = useAuth()
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false)

  return (
    <div className="min-h-full font-body">
        <div className="mb-6">
            <h1 className="font-semibold text-2xl font-display text-slate-900 tracking-tight">Good {getTimeOfDay().toLowerCase()}, <span className="capitalize">{user?.username || "Guest"}</span>!👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here's what's happening with your account.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
            
            {/* Main Content Column (Left in design) */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                <div className="flex flex-col relative z-20">
                  <BalanceCard />
                  <SpinTicketNotice />
                  <QuickActions />
                </div>
                
                <ServicesList onOpenAllServices={() => setIsServicesModalOpen(true)} />
                <SecureAccountBanner />
            </div>

            {/* Side Column (Right in design) */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col relative z-10">
              <TransactionHistory />
            </div>

        </div>
        <AllServicesModal open={isServicesModalOpen} onOpenChange={setIsServicesModalOpen} />
    </div>
  )
}

export default Dashboard


