import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StarScoreField } from "@/components/services/StarScoreField";
import { useAuth } from "@/lib/auth";
import {
  computeOverallRating,
  defaultReviewScores,
  getReviewDimensions,
} from "@/lib/serviceReviews/dimensions";
import type { ServiceCategory } from "@/types";
import type { ServiceReview } from "@/types/serviceReviews";

type Props = {
  serviceId: string;
  category: ServiceCategory;
  hasReviewed: boolean;
  onSubmit: (review: ServiceReview) => void;
};

export function ServiceReviewForm({ serviceId, category, hasReviewed, onSubmit }: Props) {
  const { user } = useAuth();
  const dimensions = useMemo(() => getReviewDimensions(category), [category]);
  const [scores, setScores] = useState(() => defaultReviewScores(category));
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <p className="text-sm font-semibold text-slate-900">Sign in to leave a review</p>
        <p className="mt-1 text-sm text-slate-600">
          Reviews use category-specific ratings so others know what to expect from this{" "}
          {category.toLowerCase()} listing.
        </p>
        <Link to="/auth/login" className="mt-4 inline-block">
          <Button size="sm">Sign in</Button>
        </Link>
      </div>
    );
  }

  if (hasReviewed || submitted) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Thanks — your review is live</p>
          <p className="mt-1 text-sm text-emerald-800">
            You can only submit one review per listing. It helps others choose the right{" "}
            {category.toLowerCase()} provider.
          </p>
        </div>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!body.trim()) {
      setError("Please add a short comment about your experience.");
      return;
    }

    const review: ServiceReview = {
      id: `user-${user.id}-${Date.now()}`,
      serviceId,
      category,
      reviewerUserId: String(user.id),
      author: user.name || "Verified customer",
      createdAt: new Date().toISOString(),
      body: body.trim(),
      scores,
      overallRating: computeOverallRating(scores),
    };

    onSubmit(review);
    setSubmitted(true);
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">Write a review</p>
      <p className="mt-1 text-xs text-slate-500">
        Rate this {category.toLowerCase()} listing on the criteria that matter most for this
        category.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {dimensions.map((dim) => (
          <StarScoreField
            key={dim.id}
            label={dim.label}
            value={scores[dim.id] ?? 4}
            onChange={(value) => setScores((prev) => ({ ...prev, [dim.id]: value }))}
          />
        ))}
      </div>

      <div className="mt-4">
        <Input
          label="Your experience"
          placeholder={`What was it like hiring this ${category.toLowerCase()} provider?`}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setError(null);
          }}
          hint="Minimum a sentence — be specific about quality, timing, or value."
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <Button type="submit" className="mt-4" size="sm">
        Submit review
      </Button>
    </form>
  );
}
