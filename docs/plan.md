### Wait to P’Guide:
- [x] S3 presigned upload module (env-guarded)
- [x] Gemini client module (env-guarded)
- [x] Omise SDK install + client module (omise-node, env-guarded)

### Day 1 — Foundation
- [x] Prisma schema + migrate dev
- [x] Verify Google Auth end-to-end
- [x] Zustand campaign creation store
- [x] Project folder structure + shared layout
- [x] Vitest setup + config + Unit tests for Zustand store +Integration tests for routes
NOTED: เพิ่ม Vitest setup + unit/integration tests ไว้เพราะต่อยอดบน API routes และ Zustand store โดยตรง หากไม่มี tests แล้วพบ bug ทีหลังจะหา root cause ยากกว่า + DoD ต้องมีเทส

### Day 2 — SelectCountry + SelectPackage
- [x] GET /api/countries + GET /api/packages
- [x] Port + wire SelectCountry page
- [x] Port + wire SelectPackage page
- [x] Store selection in Zustand

### Day 3 — AddProduct / Service
- [] POST /api/upload/presign (S3)
- [] Port + wire AddProduct page — real S3 image upload
- [] Store product data in Zustand

### Day 4 — SelectCreators + Checkout + Omise Charge
- [] GET /api/creators
- [] Port + wire SelectCreators (auto-select first N per package)
- [] POST /api/payments/create-charge — create Omise PromptPay source + charge
- [] Port + wire Checkout page — real Omise QR display, price (base + 7% VAT + 3% fee)
- [] Payment waiting screen — polls GET /api/payments/[chargeId]/status every 3s

### Day 5 — Omise Webhook + Campaign Creation
- [] POST /api/webhooks/omise — HMAC signature verify + atomic Prisma tx: Campaign + CampaignProduct + CampaignCreator[] + Payment
- [] GET /api/payments/[chargeId]/status — return status + campaignId when confirmed
- [] Wire polling → confirmed → redirect to /campaigns/[id]/brief

### Day 6 — Create Brief + AI
- [] POST /api/ai/fill-brief (Gemini)
- [] POST /api/ai/translate (Gemini)
- [] POST /api/campaigns/[id]/brief (save → status ACCEPTING)
- [] Port + wire CreateBrief page

### Day 7 — Home + Dashboard
- [] Port + wire HomePage
- [] GET /api/campaigns
- [] Port + wire Dashboard — all status tabs, sorted
- [] Route protection across all pages

### Day 8 — Campaign Detail
- [] GET /api/campaigns/[id]
- [] Port + wire CampaignDetail — status banner, creator pipeline from DB
- [] Port + wire ViewBrief (read-only + translation toggle)
- [] "สร้าง Brief" CTA for PENDING campaigns
- [] PATCH /api/campaigns/[id]/shipment → "ส่งแล้ว" (TH product) → status ACTIVE
- [] Service flow: skip shipment → ACTIVE directly after ACCEPTING
- [] Connex placeholder (global product)

### Day 9 — Demo Seed + Full Flow Wiring
- [] Seed 5 demo campaigns across all statuses with real brand data from company
- [] Wire all page routing end-to-end
- [] Plug in real S3, Gemini, Omise keys when received
- [] PATCH /api/campaigns/[id]/status scaffold (for future admin)
