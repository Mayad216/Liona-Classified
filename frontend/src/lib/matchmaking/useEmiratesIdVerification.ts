import { useCallback, useEffect, useState } from "react";
import { api, getStoredAuthToken, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  dobMatchesEmiratesId,
  isValidEmiratesId,
  readLocalEmiratesIdStatus,
  type EmiratesIdVerificationStatus,
  writeLocalEmiratesIdStatus,
} from "@/lib/matchmaking/emiratesId";

function parseApiMessage(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const parsed = JSON.parse(err.message) as { message?: string };
      if (parsed.message) return parsed.message;
    } catch {
      /* plain text */
    }
    return err.message || "Verification failed";
  }
  return "Something went wrong";
}

export function useEmiratesIdVerification() {
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState<EmiratesIdVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const token = getStoredAuthToken();

    if (token && !token.startsWith("demo-")) {
      try {
        const res = await api.emiratesIdVerification(token);
        const next: EmiratesIdVerificationStatus = {
          status: res.data.status,
          verified: res.data.verified,
          verifiedAt: res.data.verified_at ?? undefined,
          emiratesIdLast4: res.data.emirates_id_last4 ?? undefined,
          isVerified: res.data.is_verified,
        };
        setStatus(next);
        if (next.verified) {
          updateUser({ verified: true });
          writeLocalEmiratesIdStatus(next);
        }
        setLoading(false);
        return;
      } catch {
        /* fall through to local/demo */
      }
    }

    const local = readLocalEmiratesIdStatus();
    if (local?.verified) {
      setStatus(local);
      updateUser({ verified: true });
    } else if (user.verified) {
      setStatus({
        status: "verified",
        verified: true,
        isVerified: true,
      });
    } else {
      setStatus({
        status: "none",
        verified: false,
        isVerified: false,
      });
    }
    setLoading(false);
  }, [user, updateUser]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = useCallback(
    async (payload: { emiratesId: string; fullName: string; dateOfBirth: string }) => {
      if (!user) throw new Error("Sign in required");

      setSubmitting(true);
      setError(null);

      if (!isValidEmiratesId(payload.emiratesId)) {
        setSubmitting(false);
        const msg = "Invalid Emirates ID. Use format 784-YYYY-XXXXXXX-X.";
        setError(msg);
        throw new Error(msg);
      }

      if (!dobMatchesEmiratesId(payload.dateOfBirth, payload.emiratesId)) {
        setSubmitting(false);
        const msg = "Date of birth must match the year in your Emirates ID.";
        setError(msg);
        throw new Error(msg);
      }

      const token = getStoredAuthToken();

      if (token && !token.startsWith("demo-")) {
        try {
          const res = await api.submitEmiratesIdVerification(
            {
              emirates_id: payload.emiratesId,
              full_name: payload.fullName,
              date_of_birth: payload.dateOfBirth,
            },
            token
          );
          const next: EmiratesIdVerificationStatus = {
            status: res.data.status,
            verified: res.data.verified,
            verifiedAt: res.data.verified_at ?? undefined,
            emiratesIdLast4: res.data.emirates_id_last4 ?? undefined,
            isVerified: res.data.is_verified,
          };
          setStatus(next);
          writeLocalEmiratesIdStatus(next);
          updateUser({ verified: true });
          setSubmitting(false);
          return next;
        } catch (err) {
          const msg = parseApiMessage(err);
          setError(msg);
          setSubmitting(false);
          throw new Error(msg);
        }
      }

      const digits = payload.emiratesId.replace(/\D/g, "");
      const next: EmiratesIdVerificationStatus = {
        status: "verified",
        verified: true,
        verifiedAt: new Date().toISOString(),
        emiratesIdLast4: digits.slice(-4),
        isVerified: true,
      };
      writeLocalEmiratesIdStatus(next);
      setStatus(next);
      updateUser({ verified: true });
      setSubmitting(false);
      return next;
    },
    [user, updateUser]
  );

  const isVerified = Boolean(status?.verified || user?.verified);

  return {
    status,
    loading,
    submitting,
    error,
    isVerified,
    refresh,
    submit,
  };
}
