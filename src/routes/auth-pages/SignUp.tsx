import SignUpForm from "@/components/Authentication/SignUpForm"
import Logo from "@/components/navbar/Logo"
import { useAuth } from "@/context/AuthContext"
import { Navigate } from "react-router-dom"

const SignUp = () => {
  const {accessToken} = useAuth();

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0F1E] relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#583EE6] rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#00E5FF] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

        <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 relative z-10 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-center mb-2">
               <Logo imgClassName="w-[140px] h-auto object-contain" />
            </div>
            <SignUpForm />
        </div>
    </div>
  )
}

export default SignUp;