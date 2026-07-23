import { useEffect, useState } from "react";
import { mockJobs, mockListings, mockServices } from "@/data/mock";
import { api } from "@/lib/api";
import { isLiveApi } from "@/lib/apiMode";
import type { Job, Listing, Service } from "@/types";
import { extractRows, mapJob, mapListing, mapService } from "./mappers";

type CatalogState<T> = {
  items: T[];
  loading: boolean;
  error: string | null;
  live: boolean;
};

function initialState<T>(fallback: T[]): CatalogState<T> {
  return {
    items: isLiveApi() ? [] : fallback,
    loading: isLiveApi(),
    error: null,
    live: isLiveApi(),
  };
}

export function useListings(fallback = mockListings): CatalogState<Listing> {
  const [state, setState] = useState(() => initialState(fallback));

  useEffect(() => {
    if (!isLiveApi()) {
      setState({ items: fallback, loading: false, error: null, live: false });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null, live: true }));

    api
      .listings()
      .then((res) => {
        if (cancelled) return;
        setState({
          items: extractRows(res).map(mapListing),
          loading: false,
          error: null,
          live: true,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ items: [], loading: false, error: err.message, live: true });
      });

    return () => {
      cancelled = true;
    };
  }, [fallback]);

  return state;
}

export function useListing(id: string | undefined, fallback = mockListings) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(Boolean(id && isLiveApi()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setListing(null);
      setLoading(false);
      return;
    }

    if (!isLiveApi()) {
      setListing(fallback.find((l) => l.id === id) ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listing(id)
      .then((res) => {
        if (cancelled) return;
        setListing(mapListing(res.data));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setListing(null);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, fallback]);

  return { listing, loading, error, live: isLiveApi() };
}

export function useJobs(fallback = mockJobs): CatalogState<Job> {
  const [state, setState] = useState(() => initialState(fallback));

  useEffect(() => {
    if (!isLiveApi()) {
      setState({ items: fallback, loading: false, error: null, live: false });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null, live: true }));

    api
      .jobs()
      .then((res) => {
        if (cancelled) return;
        setState({
          items: extractRows(res).map(mapJob),
          loading: false,
          error: null,
          live: true,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ items: [], loading: false, error: err.message, live: true });
      });

    return () => {
      cancelled = true;
    };
  }, [fallback]);

  return state;
}

export function useJob(id: string | undefined, fallback = mockJobs) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(Boolean(id && isLiveApi()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setJob(null);
      setLoading(false);
      return;
    }

    if (!isLiveApi()) {
      setJob(fallback.find((j) => j.id === id) ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .job(id)
      .then((res) => {
        if (cancelled) return;
        setJob(mapJob(res.data));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setJob(null);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, fallback]);

  return { job, loading, error, live: isLiveApi() };
}

export function useServices(fallback = mockServices): CatalogState<Service> {
  const [state, setState] = useState(() => initialState(fallback));

  useEffect(() => {
    if (!isLiveApi()) {
      setState({ items: fallback, loading: false, error: null, live: false });
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null, live: true }));

    api
      .services()
      .then((res) => {
        if (cancelled) return;
        setState({
          items: extractRows(res).map(mapService),
          loading: false,
          error: null,
          live: true,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ items: [], loading: false, error: err.message, live: true });
      });

    return () => {
      cancelled = true;
    };
  }, [fallback]);

  return state;
}

export function useService(id: string | undefined, fallback = mockServices) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(Boolean(id && isLiveApi()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setService(null);
      setLoading(false);
      return;
    }

    if (!isLiveApi()) {
      setService(fallback.find((s) => s.id === id) ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .service(id)
      .then((res) => {
        if (cancelled) return;
        setService(mapService(res.data));
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setService(null);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, fallback]);

  return { service, loading, error, live: isLiveApi() };
}
