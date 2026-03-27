'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type QrPaymentStatus = 'pending' | 'expired' | 'completed' | 'failed';

type UseQrPaymentOptions = {
  chargeId: string | null;
  campaignId: string | null;
  chargeCreatedAt?: number | null;
  onStatusChange: (status: QrPaymentStatus) => void;
  onRecreate: (data: { chargeId: string; qrCodeUrl: string; chargeCreatedAt: number }) => void;
};

type UseQrPaymentResult = {
  secondsRemaining: number;
  recreateQr: () => Promise<void>;
  isRecreating: boolean;
};

export const QR_TTL_MS =
  parseInt(process.env.NEXT_PUBLIC_OMISE_CHARGE_EXPIRED_DURATION ?? '15', 10) * 60 * 1000;

export function useQrPayment({
  chargeId,
  campaignId,
  chargeCreatedAt,
  onStatusChange,
  onRecreate,
}: UseQrPaymentOptions): UseQrPaymentResult {
  // On mount: use stored chargeCreatedAt to restore the real remaining time after a refresh.
  // On new QR: chargeCreatedAt is undefined/null so we fall back to now.
  const expiresAtRef = useRef<number>(
    chargeCreatedAt ? chargeCreatedAt + QR_TTL_MS : Date.now() + QR_TTL_MS
  );
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    Math.max(0, Math.round((expiresAtRef.current - Date.now()) / 1000))
  );
  const [isRecreating, setIsRecreating] = useState(false);

  // Track current status to avoid polling/timer after terminal states
  const statusRef = useRef<QrPaymentStatus>('pending');
  // Track the chargeId at mount so we don't reset the timer for the initial (restored) value
  const initialChargeIdRef = useRef(chargeId);

  // Keep a ref in sync with chargeCreatedAt so the chargeId effect can read the latest value.
  // This matters for the resume page where chargeCreatedAt arrives in the same batch as chargeId
  // (after the API call resolves) — the ref must be updated before the chargeId effect runs.
  const chargeCreatedAtRef = useRef<number | null | undefined>(chargeCreatedAt);
  useEffect(() => {
    chargeCreatedAtRef.current = chargeCreatedAt;
  }, [chargeCreatedAt]);

  // Reset timer when a NEW chargeId arrives (i.e. after recreateQr or first API response on
  // the resume page). Uses chargeCreatedAtRef so a late-arriving timestamp is respected.
  useEffect(() => {
    if (!chargeId) return;
    if (chargeId === initialChargeIdRef.current) return;
    const ts = chargeCreatedAtRef.current;
    expiresAtRef.current = ts ? ts + QR_TTL_MS : Date.now() + QR_TTL_MS;
    setSecondsRemaining(Math.max(0, Math.round((expiresAtRef.current - Date.now()) / 1000)));
    statusRef.current = 'pending';
  }, [chargeId]);

  // Countdown interval — uses Date.now() comparison so tab backgrounding doesn't cause drift
  useEffect(() => {
    if (!chargeId) return;

    const interval = setInterval(() => {
      if (statusRef.current !== 'pending') {
        clearInterval(interval);
        return;
      }
      const remaining = Math.max(0, Math.round((expiresAtRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        statusRef.current = 'expired';
        onStatusChange('expired');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeId]);

  // Polling interval — checks charge status every 3s while pending
  useEffect(() => {
    if (!chargeId) return;

    const interval = setInterval(async () => {
      if (statusRef.current !== 'pending') {
        clearInterval(interval);
        return;
      }
      try {
        const res = await fetch(`/api/payments/${chargeId}/status`);
        if (!res.ok) return;
        // Re-check after the async fetch — countdown may have expired while in-flight
        if (statusRef.current !== 'pending') {
          clearInterval(interval);
          return;
        }
        const data = await res.json();
        if (data.status === 'successful') {
          statusRef.current = 'completed';
          onStatusChange('completed');
          clearInterval(interval);
        } else if (data.status === 'expired') {
          // Charge expired in Omise before local countdown reached 0 — show recreate UI
          statusRef.current = 'expired';
          onStatusChange('expired');
          clearInterval(interval);
        } else if (data.status === 'failed') {
          statusRef.current = 'failed';
          onStatusChange('failed');
          clearInterval(interval);
        }
      } catch {
        // continue polling on network errors
      }
    }, 3000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeId]);

  const recreateQr = useCallback(async () => {
    if (!campaignId || isRecreating) return;
    setIsRecreating(true);
    try {
      const res = await fetch(`/api/payments/resume/${campaignId}`);
      if (!res.ok) return;
      const data = await res.json();
      const now = Date.now();
      expiresAtRef.current = now + QR_TTL_MS;
      setSecondsRemaining(QR_TTL_MS / 1000);
      statusRef.current = 'pending';
      onStatusChange('pending');
      onRecreate({ chargeId: data.chargeId, qrCodeUrl: data.qrCodeUrl, chargeCreatedAt: now });
    } catch {
      // leave UI as-is on network error
    } finally {
      setIsRecreating(false);
    }
  }, [campaignId, isRecreating, onStatusChange, onRecreate]);

  return { secondsRemaining, recreateQr, isRecreating };
}
