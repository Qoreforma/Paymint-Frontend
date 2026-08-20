import LogInForm from "@/components/Authentication/LogInForm"
import LogoIcon from "@/components/navbar/LogoIcon"
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { accessToken } = useAuth();

  if (accessToken) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F6FA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px]">
        {/* Icon-only mark in its own tile, sitting on the page bg */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-[28px] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.08)] flex items-center justify-center">
            <LogoIcon imgClassName="w-14 h-14 object-contain" />
          </div>
        </div>

        <LogInForm />
      </div>
    </div>
  )
}

export default Login