"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setPersistAllowed } from "@/components/player/PlayerProvider";

/**
 * Stores who the listener is and whether they agreed to local storage.
 *
 * Consent is meaningful here: until it is granted we keep everything in memory
 * only, so a visitor who declines leaves no trace on their device. Favourites,
 * queue and preferences all check `storageAllowed` before persisting.
 */

const KEY_NAME = "nostalgic:name";
const KEY_CONSENT = "nostalgic:consent";
/** Bumped if the wording of what we store ever changes materially. */
const CONSENT_VERSION = "1";

export type ConsentState = "unknown" | "granted" | "declined";

type UserCtx = {
  /** Display name, or null when skipped/not yet asked. */
  name: string | null;
  /** True once we have read localStorage — avoids a flash of the wrong UI. */
  hydrated: boolean;
  /** True when the visitor has been through the welcome flow. */
  onboarded: boolean;
  consent: ConsentState;
  storageAllowed: boolean;
  setName: (name: string | null) => void;
  acceptConsent: () => void;
  declineConsent: () => void;
  /** Marks onboarding complete without setting a name ("skip"). */
  completeOnboarding: (name?: string | null, allowStorage?: boolean) => void;
  resetProfile: () => void;
};

const Ctx = createContext<UserCtx | null>(null);

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / quota — the app must keep working regardless */
  }
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentState>("unknown");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedConsent = safeGet(KEY_CONSENT);
    const granted = storedConsent === `granted:${CONSENT_VERSION}`;
    const declined = storedConsent === `declined:${CONSENT_VERSION}`;

    if (granted) {
      setConsent("granted");
      const stored = safeGet(KEY_NAME);
      if (stored !== null) setNameState(stored);
    } else if (declined) {
      setConsent("declined");
    }
    setHydrated(true);
  }, []);

  const storageAllowed = consent === "granted";

  /* Effect (not render) so the gate flips as a committed side effect. */
  useEffect(() => {
    setPersistAllowed(storageAllowed);
  }, [storageAllowed]);

  const setName = useCallback(
    (next: string | null) => {
      const clean = next?.trim().slice(0, 24) || null;
      setNameState(clean);
      if (consent !== "granted") return;
      if (clean) safeSet(KEY_NAME, clean);
      else safeSet(KEY_NAME, "");
    },
    [consent]
  );

  const acceptConsent = useCallback(() => {
    setConsent("granted");
    safeSet(KEY_CONSENT, `granted:${CONSENT_VERSION}`);
  }, []);

  const declineConsent = useCallback(() => {
    setConsent("declined");
    safeSet(KEY_CONSENT, `declined:${CONSENT_VERSION}`);
    // Honour the refusal immediately: clear anything already written.
    safeRemove(KEY_NAME);
    for (const k of [
      "nostalgic:recent",
      "nostalgic:favourites",
      "nostalgic:resume",
      "nostalgic:prefs",
      "nostalgic:queue",
      "nostalgic:searchHistory",
    ]) {
      safeRemove(k);
    }
  }, []);

  const completeOnboarding = useCallback(
    (next?: string | null, allowStorage?: boolean) => {
      const clean = next?.trim().slice(0, 24) || null;
      setNameState(clean);
      // `allowStorage` is passed explicitly by the welcome flow: reading
      // `consent` here would see the pre-click value and silently drop the name.
      const persist = allowStorage ?? consent === "granted";
      if (persist) safeSet(KEY_NAME, clean ?? "");
    },
    [consent]
  );

  const resetProfile = useCallback(() => {
    setNameState(null);
    setConsent("unknown");
    safeRemove(KEY_NAME);
    safeRemove(KEY_CONSENT);
  }, []);

  /* Onboarded once a choice has been recorded, either way. */
  const onboarded = consent !== "unknown";

  const value = useMemo<UserCtx>(
    () => ({
      name,
      hydrated,
      onboarded,
      consent,
      storageAllowed,
      setName,
      acceptConsent,
      declineConsent,
      completeOnboarding,
      resetProfile,
    }),
    [
      name,
      hydrated,
      onboarded,
      consent,
      storageAllowed,
      setName,
      acceptConsent,
      declineConsent,
      completeOnboarding,
      resetProfile,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser(): UserCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
