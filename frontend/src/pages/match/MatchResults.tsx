import { Navigate } from "react-router-dom";

/** Legacy route — matches now live on the Match Me seeker page. */
export function MatchResults() {
  return <Navigate to="/match/seeker" replace />;
}
