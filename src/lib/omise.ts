// Omise payment gateway — credentials pending from company
// All functions are no-ops until OMISE_SECRET_KEY is configured
// Server-side only — never expose OMISE_SECRET_KEY to the client

import Omise from "omise";

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
  });

  return {
    chargeId: charge.id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qrCodeUrl: (charge as any).source?.scannable_code?.image?.download_uri ?? "",
    amount: charge.amount,
    status: charge.status,
  };
}

export async function retrieveCharge(chargeId: string): Promise<{
  status: string;
  paid: boolean;
  amount: number;
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
  };
}
