import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useEmiratesIdVerification } from "@/lib/matchmaking/useEmiratesIdVerification";

export function MatchVerifiedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isVerified, loading: verifyLoading } = useEmiratesIdVerification();
  const location = useLocation();

  if (authLoading || verifyLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50/60">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (!isVerified) {
    return (
      <Navigate
        to="/match/verify"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <>{children}</>;
}
