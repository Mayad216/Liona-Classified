import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-[120px] font-black leading-none gradient-text">404</div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-600">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/">
          <Button>
            <Home className="h-4 w-4" /> Go home
          </Button>
        </Link>
        <button onClick={() => window.history.back()}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> Go back
          </Button>
        </button>
      </div>
    </div>
  );
}
