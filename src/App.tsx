import { lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { Toaster } from 'sonner';
import { AlertTriangle, Info } from "lucide-react";
import { FaCircleCheck } from "react-icons/fa6";
import { BiErrorCircle } from "react-icons/bi";

import { NotificationPrompt } from "./components/ui/NotificationPrompt";

import AuthLayout from "./routes/layout/AuthLayout";
import DashboardLayout from "./routes/layout/DashboardLayout";
import ReceiptLayout from "./routes/layout/ReceiptLayout";
import Login from "./routes/auth-pages/LogIn";
import SignUp from "./routes/auth-pages/SignUp";
import Dashboard from "./components/dashboard/main-page/Dashboard";
import NotFoundPage from "./components/NotFoundPage";

// Lazy-loaded auth pages
const TwoFAOtp = lazy(() => import("./routes/auth-pages/TwoFAOtp"));
const VerifyPhone = lazy(() => import("./routes/auth-pages/VerifyPhone"));
const UserDetails = lazy(() => import("./routes/auth-pages/UserDetails"));
const VerifyEmail = lazy(() => import("./routes/auth-pages/VerifyEmail"));
const SetTransactionPin = lazy(() => import("./routes/auth-pages/SetTransactionPin"));
const ResetPassword = lazy(() => import("./routes/auth-pages/ResetPassword"));

// Lazy-loaded dashboard pages
const History = lazy(() => import("./routes/dashboard/History"));
const TxnHistoryDetail = lazy(() => import("./routes/dashboard/TxnHistoryDetail"));
const NotificationsPage = lazy(() => import("./routes/dashboard/NotificationsPage"));
const AffiliatePage = lazy(() => import("./routes/dashboard/AffiliatePage"));
const TransferFunds = lazy(() => import("./routes/dashboard/TransferFunds"));
const ReferralPage = lazy(() => import("./routes/dashboard/ReferralPage"));
const Status = lazy(() => import("./routes/dashboard/Status"));
const WithdrawFunds = lazy(() => import("./routes/dashboard/WithdrawFunds"));
const AddFunds = lazy(() => import("./routes/dashboard/AddFunds"));
const StaticAccount = lazy(() => import("./routes/dashboard/StaticAccount"));
const SettingsPage = lazy(() => import("./routes/dashboard/SettingsPage"));

// Lazy-loaded settings tabs
const AccountSettings = lazy(() => import("./components/dashboard/settings/AccountSettings"));
const SecuritySettings = lazy(() => import("./components/dashboard/settings/SecuritySettings"));
const BankInfoSettings = lazy(() => import("./components/dashboard/settings/BankInfoSettings"));
const Support = lazy(() => import("./components/dashboard/settings/Support"));
const Faqs = lazy(() => import("./components/dashboard/settings/Faqs"));

// Lazy-loaded bill payment & services
const Airtime = lazy(() => import("./components/dashboard/services/airtime/Airtime"));
const Data = lazy(() => import("./components/dashboard/services/data/Data"));
const Electricity = lazy(() => import("./components/dashboard/services/electricity/Electricity"));
const Betting = lazy(() => import("./components/dashboard/services/betting/Betting"));
const TVCable = lazy(() => import("./components/dashboard/services/tv-cable/TVCable"));
const Epin = lazy(() => import("./components/dashboard/services/epin/Epin"));
const Smm = lazy(() => import("./components/dashboard/services/smm/Smm"));
const InternationalAirtime = lazy(() => import("./components/dashboard/services/international-airtime/InternationalAirtime"));
const InternationalData = lazy(() => import("./components/dashboard/services/international-data/InternationalData"));
const AirtimePrint = lazy(() => import("./components/dashboard/services/airtime-print/AirtimePrint"));
const DataPrint = lazy(() => import("./components/dashboard/services/data-print/DataPrint"));
const AirtimeCash = lazy(() => import("./components/dashboard/services/airtime-cash/AirtimeCash"));

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
          path: "services/smm",
          element: <Smm />
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
          path: "referrals",
          element: <Navigate to="/dashboard/referral" replace />
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
