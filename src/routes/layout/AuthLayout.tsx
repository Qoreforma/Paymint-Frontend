import { Navigate, Outlet } from "react-router-dom"
import { Suspense } from "react"
import ScrollToTop from "@/components/ScrollToTop"
import Loader from "@/components/Loader"
import { useAuth } from "@/context/AuthContext"

const AuthLayout = () => {
  const { accessToken, loading } = useAuth();

  if (!loading && accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen">  
      <ScrollToTop>
        <Suspense fallback={<Loader className="min-h-[60vh] w-full" />}>
          <Outlet />
        </Suspense>
      </ScrollToTop>
    </main>
  );
};

export default AuthLayout;