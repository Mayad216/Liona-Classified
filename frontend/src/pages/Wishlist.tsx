import { Link } from "react-router-dom";
import { Heart, Trash2, Sparkles, ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { mockListings } from "@/data/mock";
import { Button } from "@/components/ui/Button";
import { useLocalList } from "@/lib/useLocalList";

export const WISHLIST_KEY = "khaleej:wishlist";

export function useWishlist() {
  return useLocalList<string>(WISHLIST_KEY);
}

export function Wishlist() {
  const wishlist = useWishlist();
  const items = wishlist.items
    .map((id) => mockListings.find((l) => l.id === id))
    .filter(Boolean);

  return (
    <div className="bg-slate-50/60 pb-20 pt-10">
      <div className="container">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              <Heart className="h-3.5 w-3.5 fill-current" />
              My Wishlist
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Listings you've loved
            </h1>
            <p className="mt-2 text-slate-600">
              {items.length} saved · We'll alert you on price drops & status changes.
            </p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="md"
              onClick={() => wishlist.clear()}
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Heart className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-lg font-bold">No favourites yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Tap the heart on any listing to save it here.
            </p>
            <Link to="/accommodation">
              <Button size="lg" className="mt-6">
                Browse listings <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((l) => (
                <div key={l!.id} className="group relative">
                  <button
                    onClick={() => wishlist.remove(l!.id)}
                    className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-red-500 transition hover:bg-red-500 hover:text-white"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ListingCard listing={l!} />
                </div>
              ))}
            </div>

            <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-accent-700 p-8 text-white">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" />
                    Pro tip
                  </div>
                  <p className="mt-3 max-w-lg text-base">
                    You've shortlisted {items.length} listings. Let the AI rank them by
                    compatibility with your roommate profile.
                  </p>
                </div>
                <Link to="/match/profile">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-brand-700 hover:bg-brand-50"
                  >
                    Build my profile <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
