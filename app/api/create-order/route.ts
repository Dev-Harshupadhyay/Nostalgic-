import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateOrderBody = {
  amount?: unknown;
  currency?: unknown;
  receipt?: unknown;
};

type RazorpaySdkError = {
  statusCode?: number;
  error?: {
    code?: string;
    description?: string;
  };
  message?: string;
};

/**
 * POST /api/create-order
 *
 * Creates a Razorpay order via https://api.razorpay.com/v1/orders.
 * Expects `amount` in paise (minimum 100 paise = ₹1).
 */
export async function POST(req: NextRequest) {
  let body: CreateOrderBody;
  try {
    body = (await req.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const rawAmount = Number(body?.amount);
  const amount = Number.isFinite(rawAmount) ? Math.round(rawAmount) : NaN;

  if (!Number.isFinite(amount) || amount < 100) {
    return NextResponse.json(
      { error: "Invalid amount. Minimum amount is 100 paise (₹1)." },
      { status: 400 }
    );
  }

  const currency =
    typeof body?.currency === "string" && body.currency.trim().length > 0
      ? body.currency.trim().toUpperCase()
      : "INR";

  const receipt =
    typeof body?.receipt === "string" && body.receipt.trim().length > 0
      ? body.receipt.trim().slice(0, 40)
      : `rcpt_${Date.now()}`;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay authentication credentials are not configured." },
      { status: 401 }
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    return NextResponse.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const sdkError = err as RazorpaySdkError;
    const statusCode = sdkError?.statusCode;
    const description =
      sdkError?.error?.description ||
      sdkError?.message ||
      "Failed to create Razorpay order.";

    if (
      statusCode === 401 ||
      /auth/i.test(description)
    ) {
      return NextResponse.json(
        { error: description || "Razorpay authentication failed." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: description },
      { status: 500 }
    );
  }
}
