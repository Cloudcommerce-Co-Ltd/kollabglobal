// Admin endpoint: returns live queue stats for the payment-events BullMQ queue.
// Full Bull Board UI requires Express or a custom server; this JSON stats endpoint
// is the App Router-compatible alternative for MVP ops visibility.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { paymentQueue } from "@/lib/queue/payment-queue";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      paymentQueue.getWaitingCount(),
      paymentQueue.getActiveCount(),
      paymentQueue.getCompletedCount(),
      paymentQueue.getFailedCount(),
      paymentQueue.getDelayedCount(),
    ]);

    const recentFailed = await paymentQueue.getFailed(0, 9); // last 10 failed jobs

    return NextResponse.json({
      queue: "payment-events",
      counts: { waiting, active, completed, failed, delayed },
      recentFailed: recentFailed.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
      })),
    });
  } catch (err) {
    console.error("[admin/queues] Failed to fetch queue stats:", err);
    return NextResponse.json({ error: "Failed to fetch queue stats" }, { status: 500 });
  }
}
