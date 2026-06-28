# DukanOs Phase 0 — Refocus & Foundation

This pivot collapses the current "Shree Umiya"-branded retail OS into a **category-agnostic Business OS** for Indian micro-businesses. Phase 0 must ship together: onboarding, profile, billing with GST toggle, and full removal of the Online Store.

Phase 1 (Contacts sync, WhatsApp bulk, reminders, backup) is scoped but **not built in this plan** — it lands in a follow-up after Phase 0 is stable.

---

## 1. Scope of this plan (Phase 0 only)

### A. Remove Online Store
- Delete routes `/online-store`, `/stores`, `/store/:slug` and pages `OnlineStore.tsx`, `Stores.tsx`, `PublicStore.tsx`, `StoreCheckout.tsx`, `StoreProfileEditor.tsx`, `PublicStore`-related components.
- Strip every "Online Store" nav entry from `AppLayout`, `BottomNav`, `More.tsx`, `Settings.tsx`, landing page (`Index.tsx`).
- Remove `online_store` tables/usage from `offline-db.ts` (keep the data readable for export but hide UI; no destructive migration needed since data is local IndexedDB).
- Replace landing page copy/positioning from "Shree Umiya Electronics" to **DukanOs — Business OS for every Indian shop**.

### B. Onboarding & Auth (mobile-OTP)
- New flow: Business Name → Owner Name → **Mobile + OTP** → Address → Maps location (skip) → GSTIN (skip) → State/City.
- Auth via Lovable Cloud **Phone (SMS)** provider. No password field anywhere.
- Optional PIN lock stored locally (Phase 0.5 — stub UI only, real biometric later).
- Existing email/password `Auth.tsx` retired and replaced by `Auth.tsx` (phone OTP) + multi-step `Onboarding.tsx`.

### C. Business Profile & Branding
- Single Settings → Business Profile screen: Name, Logo, Address, GSTIN, Maps URL, Mobile.
- Live preview of how it renders on an invoice.
- Profile stored in `business_profile` table (Cloud) with offline mirror.

### D. Bill / Invoice Generator (the hero feature)
- New `/billing` route (replaces current `/sales` POS as the primary entry).
- Two modes in one flow:
  - **Product mode**: item × qty × rate.
  - **Service mode**: description + flat amount (for repair/garage/salon).
- **GST toggle per bill** (off by default). When on: show CGST/SGST/IGST split + GSTIN on PDF; when off: zero tax UI, clean non-GST bill.
- 3 invoice templates: **Simple**, **Professional/GST**, **Branded**. All share strict tabular alignment (already-fixed `tnum` + `setCharSpace(0)` rules stay).
- Send actions: WhatsApp (deep link `wa.me` with PDF link in Phase 0; true Business API in Phase 1), Download PDF, Copy share link.
- Save as draft / finalize.

### E. Navigation & IA reset
- Bottom nav (mobile): **Home · Bills · Customers · More**.
- Sidebar (desktop): Dashboard, Bills, Customers, Reports, Settings.
- Hide (don't delete) Inventory, Purchase, Expenses, Job Cards, Automations behind More → "Advanced" until Phase 1 polish.

---

## 2. Data model (Lovable Cloud)

```text
business_profile (1 per owner)
  id, owner_id, name, logo_url, address, gstin?, maps_url?, mobile, state, city, created_at

bills
  id, business_id, bill_no, mode ('product'|'service'),
  gst_enabled bool, customer_id?, customer_name, customer_mobile?,
  subtotal, cgst, sgst, igst, total, status ('draft'|'final'|'sent'),
  template ('simple'|'professional'|'branded'),
  pdf_url?, created_at

bill_items
  id, bill_id, description, hsn?, qty, rate, gst_rate?, amount

customers
  id, business_id, name, mobile, tag ('customer'|'supplier'|null), source ('manual'|'phone'|'google')
```

RLS: every row scoped by `business_id` → `owner_id = auth.uid()`. GRANTs to `authenticated` + `service_role` as per project rules. `user_roles` table stays for Phase 1 staff logins (unused now).

---

## 3. File changes

**Delete**
- `src/pages/OnlineStore.tsx`, `Stores.tsx`, `PublicStore.tsx`, `POS.tsx` (or repurpose)
- `src/components/store/*`, `src/components/payment/StoreCheckout.tsx`
- `src/components/pos/*` (move CartPanel logic into new BillBuilder)

**Create**
- `src/pages/Billing.tsx` — bill list + "New Bill" CTA
- `src/pages/BillEditor.tsx` — full-screen bill builder (product/service modes, GST toggle, template picker, send sheet)
- `src/pages/Onboarding.tsx` — rewritten multi-step
- `src/pages/Auth.tsx` — rewritten phone-OTP
- `src/components/billing/InvoiceTemplateSimple.tsx`, `InvoiceTemplateProfessional.tsx`, `InvoiceTemplateBranded.tsx`
- `src/components/billing/BillSendSheet.tsx`
- `src/components/settings/BusinessProfileForm.tsx`
- `supabase/migrations/<ts>_phase0.sql` — tables + RLS + GRANTs

**Edit**
- `src/App.tsx` — new routes, drop store routes
- `src/components/layout/AppLayout.tsx`, `BottomNav.tsx` — new IA
- `src/pages/Index.tsx` — DukanOs landing copy
- `src/pages/Settings.tsx`, `More.tsx`, `Dashboard.tsx` — drop store, point to Billing
- `src/lib/generate-invoice-pdf.ts` — accept template + gst flag
- `src/hooks/use-auth.tsx` — phone OTP methods (`signInWithOtp`, `verifyOtp`)

---

## 4. Visual direction
- Drop "Shree Umiya Electronics" brand. New identity: **DukanOs** — warm Indian-shop palette (deep indigo + saffron accent + cream paper), Hindi-ready type pairing (Hind + Inter). Mobile-first cards, large 56px tap targets, bilingual labels (EN/HI).
- All colors via semantic tokens in `index.css` (no hardcoded hex in components).

---

## 5. Out of scope for this plan
- Real WhatsApp Business API integration (Phase 1)
- Google/Phone Contacts sync (Phase 1)
- Automated reminder scheduler/edge function (Phase 1)
- Cloud backup export job (Phase 1)
- Multi-staff, inventory, analytics (Phase 2)

---

## 6. Open questions before I build
1. **Phone OTP provider**: enable Lovable Cloud Phone auth (uses Twilio under the hood — needs your SMS sender). OK to enable, or prefer email-OTP fallback for now?
2. **Existing data**: current project has live "Shree Umiya" invoices in IndexedDB. Migrate them into the new `bills` schema, or treat Phase 0 as a clean slate with an export-to-CSV button for old data?
3. **POS keep-or-kill**: the fast `/pos` cart screen — keep as a "Quick Bill" shortcut inside Billing, or delete entirely in favor of the new BillEditor?
4. **Landing page**: full rebrand to DukanOs now, or keep Shree Umiya landing until Phase 1?

Answer these and I'll execute Phase 0 in one pass.
