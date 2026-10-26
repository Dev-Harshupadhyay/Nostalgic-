"use client";

import { SITE, SUPPORT } from "@/lib/site";

export const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
};

export type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
  };
};

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (
    event: "payment.failed",
    callback: (response: RazorpayFailureResponse) => void
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<boolean> | null = null;

/**
 * Ensures `https://checkout.razorpay.com/v1/checkout.js` is loaded and
 * `window.Razorpay` is available before opening the payment modal.
 */
export function ensureRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.Razorpay === "function") return Promise.resolve(true);

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`
    );

    if (existing) {
      if (typeof window.Razorpay === "function") {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(typeof window.Razorpay === "function"), {
        once: true,
      });
      existing.addEventListener(
        "error",
        () => {
          scriptPromise = null;
          resolve(false);
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(typeof window.Razorpay === "function");
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export type VerifiedPaymentResult = {
  orderId: string;
  paymentId: string;
  signature: string;
  amountRupees: number;
};

export type StartRazorpayCheckoutParams = {
  amountRupees: number;
  customerName?: string;
  onSuccess?: (result: VerifiedPaymentResult) => void;
  onDismiss?: (message: string) => void;
  onError?: (message: string) => void;
};

/**
 * Full Standard Web Checkout flow:
 * 1. Validates amount >= 100 paise (₹1)
 * 2. Calls POST /api/create-order
 * 3. Opens Razorpay modal with order_id
 * 4. Verifies signature via POST /api/verify-payment
 * 5. Handles modal dismiss & payment.failed events
 */
export async function startRazorpayCheckout({
  amountRupees,
  customerName,
  onSuccess,
  onDismiss,
  onError,
}: StartRazorpayCheckoutParams): Promise<void> {
  const amountPaise = Math.round(Number(amountRupees) * 100);

  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    onError?.("Minimum amount is ₹1 (100 paise).");
    return;
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    onError?.("Razorpay Key ID is not configured.");
    return;
  }

  const loaded = await ensureRazorpayCheckoutScript();
  if (!loaded || typeof window.Razorpay !== "function") {
    onError?.("Could not load Razorpay Checkout script. Please check your connection.");
    return;
  }

  let orderData: {
    order_id?: string;
    amount?: number;
    currency?: string;
    error?: string;
  };

  try {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: amountPaise,
        currency: SUPPORT.currency,
        receipt: `rcpt_${Date.now()}`,
      }),
    });

    orderData = await res.json();

    if (!res.ok || !orderData?.order_id) {
      onError?.(orderData?.error || "Failed to create Razorpay order.");
      return;
    }
  } catch (err) {
    onError?.(
      err instanceof Error ? err.message : "Network error while creating order."
    );
    return;
  }

  const rzp = new window.Razorpay({
    key: keyId,
    amount: orderData.amount ?? amountPaise,
    currency: orderData.currency ?? SUPPORT.currency,
    name: SITE.name,
    description: `${SUPPORT.note} · ₹${amountRupees}`,
    order_id: orderData.order_id,
    prefill: customerName ? { name: customerName } : undefined,
    notes: {
      purpose: SUPPORT.note,
      upi_id: SUPPORT.upiId,
      universal_link: SUPPORT.razorpayLink,
    },
    theme: {
      color: "#e8a33d",
    },
    modal: {
      ondismiss: () => {
        onDismiss?.("Payment cancelled — you closed the checkout window.");
      },
    },
    handler: async (response: RazorpaySuccessResponse) => {
      try {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = (await verifyRes.json()) as {
          success?: boolean;
          verified?: boolean;
          error?: string;
        };

        if (!verifyRes.ok || !verifyData?.verified) {
          onError?.(
            verifyData?.error || "Payment signature verification failed."
          );
          return;
        }

        onSuccess?.({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          amountRupees,
        });
      } catch (err) {
        onError?.(
          err instanceof Error
            ? err.message
            : "Error verifying payment signature."
        );
      }
    },
  });

  rzp.on("payment.failed", (failure: RazorpayFailureResponse) => {
    const message =
      failure?.error?.description ||
      failure?.error?.reason ||
      "Payment failed. Please try again.";
    onError?.(message);
  });

  rzp.open();
}
