### Wait to P’Guide:
- [x] S3 presigned upload module (env-guarded)
- [] Gemini client module (env-guarded)
- [] Omise SDK install + client module (omise-node, env-guarded)

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
- [x] Update the user interface to make it responsive.
- [x] POC Omise payment (QRcode only)
- [x] S3 presigned upload module setup

### Day 3 — AddProduct / Service
- [x] POST /api/upload/presign (S3)
- [x] Port + wire AddProduct page — real S3 image upload
- [x] Store product data in Zustand

### Day 4 — SelectCreators + Checkout + Omise Charge
- [x] GET /api/creators
- [x] Port + wire SelectCreators (auto-select first N per package)
- [x] POST /api/payments/create-charge — create Omise PromptPay source + charge
- [x] Port + wire Checkout page — real Omise QR display, price (base + 7% VAT + 3% fee)
- [x] Payment waiting screen — polls GET /api/payments/[chargeId]/status every 3s

### Day 5 — Omise Webhook + Campaign Creation
- [x] POST /api/webhooks/omise — HMAC signature verify + atomic Prisma tx: Campaign + CampaignProduct + CampaignCreator[] + Payment
- [x] GET /api/payments/[chargeId]/status — return status + campaignId when confirmed
- [x] Wire polling → confirmed → redirect to /campaigns/[id]/brief

### Day 6 — Create Brief + AI
- [x] POST /api/ai/fill-brief (Gemini)
- [x] POST /api/ai/translate (Gemini)
- [x] POST /api/campaigns/[id]/brief (save → status ACCEPTING)
- [x] Port + wire CreateBrief page

### Day 7 — Home + Dashboard
- [x] Port + wire HomePage
- [x] GET /api/campaigns
- [x] Port + wire Dashboard — all status tabs, sorted
- [x] Route protection across all pages

### Day 8 — Campaign Detail
- [x] GET /api/campaigns/[id]
- [x] Port + wire CampaignDetail — status banner, creator pipeline from DB
- [x] Port + wire ViewBrief (read-only + translation toggle)
- [x] "สร้าง Brief" CTA for PENDING campaigns
- [x] PATCH /api/campaigns/[id]/shipment → "ส่งแล้ว" (TH product) → status ACTIVE
- [x] Service flow: skip shipment → ACTIVE directly after ACCEPTING
- [x] Connex placeholder (global product)

### Day 9 — Demo Seed + Full Flow Wiring
- [x] Seed 5 demo campaigns across all statuses with real brand data from company
- [x] Wire all page routing end-to-end
- [x] Plug in real S3, Gemini, Omise keys when received
- [] PATCH /api/campaigns/[id]/status scaffold (for future admin)
