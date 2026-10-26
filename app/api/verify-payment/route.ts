import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VerifyPaymentBody = {
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
  order_id?: unknown;
  payment_id?: unknown;
  signature?: unknown;
};

/**
 * POST /api/verify-payment
 *
 * Verifies a Razorpay payment signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET).
 * Returns 200 only when the signature matches; returns 400 on missing fields or mismatch.
 */
export async function POST(req: NextRequest) {
  let body: VerifyPaymentBody;
  try {
    body = (await req.json()) as VerifyPaymentBody;
  } catch {
    return NextResponse.json(
      { success: false, verified: false, error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const orderId =
    typeof body?.razorpay_order_id === "string"
      ? body.razorpay_order_id.trim()
      : typeof body?.order_id === "string"
        ? body.order_id.trim()
        : "";

  const paymentId =
    typeof body?.razorpay_payment_id === "string"
      ? body.razorpay_payment_id.trim()
      : typeof body?.payment_id === "string"
        ? body.payment_id.trim()
        : "";

  const razorpaySignature =
    typeof body?.razorpay_signature === "string"
      ? body.razorpay_signature.trim()
      : typeof body?.signature === "string"
        ? body.signature.trim()
        : "";

  if (!orderId || !paymentId || !razorpaySignature) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error:
          "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.",
      },
      { status: 400 }
    );
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: "Razorpay secret key is not configured on the server.",
      },
      { status: 500 }
    );
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(generatedSignature, "utf8");
  const receivedBuffer = Buffer.from(razorpaySignature, "utf8");

  const isValid =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: "Payment signature verification failed.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      verified: true,
      order_id: orderId,
      payment_id: paymentId,
    },
    { status: 200 }
  );
}
