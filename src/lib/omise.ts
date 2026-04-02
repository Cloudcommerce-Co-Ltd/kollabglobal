// Omise payment gateway — credentials pending from company
// All functions are no-ops until OMISE_SECRET_KEY is configured
// Server-side only — never expose OMISE_SECRET_KEY to the client

import Omise from "omise";

/**
 * Extended Omise ISource interface that includes the scannable_code.image.download_uri
 * field returned by the API but not typed in the SDK.
 */
interface OmiseSourceWithQR extends Omise.Sources.ISource {
  scannable_code: Omise.Sources.IScannableCode & {
    image: Omise.Disputes.IDocument & {
      download_uri?: string;
    };
  };
}

/**
 * Extended Omise ICharge interface that uses the extended source type.
 */
interface OmiseChargeWithQR extends Omise.Charges.ICharge {
  source?: OmiseSourceWithQR;
}

export const isOmiseConfigured = (): boolean =>
  !!process.env.OMISE_SECRET_KEY;

export async function createPromptPayCharge(amountSatang: number): Promise<{
  chargeId: string;
  qrCodeUrl: string;
  amount: number;
  status: string;
}> {
  if (!isOmiseConfigured()) {
    throw new Error("Omise is not configured: OMISE_SECRET_KEY is missing");
  }

  const omise = Omise({ secretKey: process.env.OMISE_SECRET_KEY, publicKey: process.env.OMISE_PUBLIC_KEY });

  const source = await omise.sources.create({
    type: "promptpay",
    amount: amountSatang,
    currency: "THB",
  });

  const charge = await omise.charges.create({
    amount: amountSatang,
    currency: "THB",
    source: source.id,
    expires_at: new Date(Date.now() + parseInt(process.env.OMISE_CHARGE_EXPIRED_DURATION ?? '15', 10) * 60 * 1000).toISOString(),
  });

  return {
    chargeId: charge.id,
    qrCodeUrl: (charge as OmiseChargeWithQR).source?.scannable_code?.image?.download_uri ?? "",
    amount: charge.amount,
    status: charge.status,
  };
}

export async function expireCharge(chargeId: string): Promise<void> {
  if (!isOmiseConfigured()) {
    throw new Error("Omise is not configured: OMISE_SECRET_KEY is missing");
  }
  const omise = Omise({ secretKey: process.env.OMISE_SECRET_KEY, publicKey: process.env.OMISE_PUBLIC_KEY });
  await omise.charges.expire(chargeId);
}

export async function retrieveCharge(chargeId: string): Promise<{
  status: string;
  paid: boolean;
  amount: number;
  qrCodeUrl: string;
  createdAt: string;
}> {
  if (!isOmiseConfigured()) {
    throw new Error("Omise is not configured: OMISE_SECRET_KEY is missing");
  }

  const omise = Omise({ secretKey: process.env.OMISE_SECRET_KEY, publicKey: process.env.OMISE_PUBLIC_KEY });

  const charge = await omise.charges.retrieve(chargeId);

  return {
    status: charge.status,
    paid: charge.paid,
    amount: charge.amount,
    qrCodeUrl: (charge as OmiseChargeWithQR).source?.scannable_code?.image?.download_uri ?? "",
    createdAt: (charge as OmiseChargeWithQR).created_at ?? new Date().toISOString(),
  };
}
