import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { Toaster } from 'sonner';


import { NotificationPrompt } from "./components/ui/NotificationPrompt";

import AuthLayout from "./routes/layout/AuthLayout";
import VerifyPhone from "./routes/auth-pages/VerifyPhone";
import UserDetails from "./routes/auth-pages/UserDetails";
import VerifyEmail from "./routes/auth-pages/VerifyEmail";
import SetTransactionPin from "./routes/auth-pages/SetTransactionPin";
import ResetPassword from "./routes/auth-pages/ResetPassword";
import SignUp from "./routes/auth-pages/SignUp";
import Login from "./routes/auth-pages/LogIn";

import DashboardLayout from "./routes/layout/DashboardLayout";

import Dashboard from "./components/dashboard/main-page/Dashboard";
import NotificationsPage from "./routes/dashboard/NotificationsPage";
import AffiliatePage from "./routes/dashboard/AffiliatePage";
import { AlertTriangle, Info } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";
import TransferFunds from "./routes/dashboard/TransferFunds";
import ReferralPage from "./routes/dashboard/ReferralPage";
import Status from "./routes/dashboard/Status";
import ReceiptLayout from "./routes/layout/ReceiptLayout";
import WithdrawFunds from "./routes/dashboard/WithdrawFunds";
import AddFunds from "./routes/dashboard/AddFunds";
import StaticAccount from "./routes/dashboard/StaticAccount";
import Airtime from "./components/dashboard/services/airtime/Airtime";
import Data from "./components/dashboard/services/data/Data";
import Electricity from "./components/dashboard/services/electricity/Electricity";
import Betting from "./components/dashboard/services/betting/Betting";
import TVCable from "./components/dashboard/services/tv-cable/TVCable";
import Epin from "./components/dashboard/services/epin/Epin";
import SettingsPage from "./routes/dashboard/SettingsPage";
import AccountSettings from "./components/dashboard/settings/AccountSettings";
import SecuritySettings from "./components/dashboard/settings/SecuritySettings";
import BankInfoSettings from "./components/dashboard/settings/BankInfoSettings";
import Support from "./components/dashboard/settings/Support";
import Faqs from "./components/dashboard/settings/Faqs";
import History from "./routes/dashboard/History";
import TxnHistoryDetail from "./routes/dashboard/TxnHistoryDetail";
import NotFoundPage from "./components/NotFoundPage";
import TwoFAOtp from "./routes/auth-pages/TwoFAOtp";
import { BiErrorCircle } from "react-icons/bi";
import InternationalAirtime from "./components/dashboard/services/international-airtime/InternationalAirtime";
import InternationalData from "./components/dashboard/services/international-data/InternationalData";
import AirtimePrint from "./components/dashboard/services/airtime-print/AirtimePrint";
import DataPrint from "./components/dashboard/services/data-print/DataPrint";
import AirtimeCash from "./components/dashboard/services/airtime-cash/AirtimeCash";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/auth/login" replace />,
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "two-factor-authentication",
          element: <TwoFAOtp />,
        },
        {
          path: "signup",
          element: <SignUp />,
        },
        {
          path: "verify-phone",
          element: <VerifyPhone />,
        },
        {
          path: "user-details",
          element: <UserDetails />,
        },
        {
          path: "verify-email",
          element: <VerifyEmail />,
        },
        {
          path: "set-pin",
          element: <SetTransactionPin />,
        },
        {
          path: "reset-password",
          element: <ResetPassword />,
        },
      ]
    },
    {
      path: "/dashboard",
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: <Dashboard />
        },
        {
          path: "history",
          element: <History />
        },
        {
          path: "history/:id",
          element: <TxnHistoryDetail />
        },
        {
          path: "transfer-funds",
          element: <TransferFunds />
        },
        {
          path: "withdraw-funds",
          element: <WithdrawFunds />
        },
        {
          path: "add-funds",
          element: <AddFunds />
        },
        {
          path: "static-account",
          element: <StaticAccount />
        },

        {
          path: "services/airtime",
          element: <Airtime />
        },
        {
          path: "services/airtime-cash",
          element: <AirtimeCash />
        },
        {
          path: "services/data",
          element: <Data />
        },
        {
          path: "services/international-airtime",
          element: <InternationalAirtime />
        },
        {
          path: "services/international-data",
          element: <InternationalData />
        },
        {
          path: "services/airtime-print",
          element: <AirtimePrint />
        },
        {
          path: "services/data-print",
          element: <DataPrint />
        },
        {
          path: "services/electricity",
          element: <Electricity />
        },
        {
          path: "services/betting",
          element: <Betting />
        },
        {
          path: "services/cable",
          element: <TVCable />
        },
        {
          path: "services/epin",
          element: <Epin />
        },
        {
          path: "affiliate",
          element: <AffiliatePage />
        },
        {
          path: "referral",
          element: <ReferralPage />
        },
        {
          path: "notifications",
          element: <NotificationsPage />
        },       
        {
          path: "status",
          element: <Status />
        },
        {
          path: "settings",
          element: <SettingsPage />
        },
        {
          path: "settings/account",
          element: <AccountSettings />
        },
        {
          path: "settings/security",
          element: <SecuritySettings />
        },
        {
          path: "settings/bank-info",
          element: <BankInfoSettings />
        },
        {
          path: "settings/support",
          element: <Support />
        },
        {
          path: "settings/faqs",
          element: <Faqs />
        },
      ]
    },
    {
      path: "/receipt",
      element: <ReceiptLayout />
    },
    {
      path: "*",
      element: <NotFoundPage />, //custom 404 page
    },
  ]);
  

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: "rounded-md font-medium px-3 py-2 text-sm shadow-lg flex items-center gap-2",
            description: "mt-1 text-sm",
            // Per-type variant styling
            success: "bg-green-100 text-green-800",
            error:   "bg-red-100   text-red-800",
            warning: "bg-yellow-100 text-yellow-800",
            info:    "bg-blue-100  text-blue-800",
            icon:    "group-data-[type=success]:text-green-600 group-data-[type=error]:text-red-600 group-data-[type=warning]:text-yellow-600 group-data-[type=info]:text-blue-600",
          },
        }}
        icons={{
          success: <FaCircleCheck className="text-green-800 size-4" />,
          warning: <AlertTriangle className="text-yellow-500 size-4" />,
          info: <Info className="text-blue-500 size-4" />,
          error: <BiErrorCircle className="text-red-500 size-4" />
        }}
      />
      <NotificationPrompt />
      <RouterProvider router={router} />
    </>
  )
}

export default App
