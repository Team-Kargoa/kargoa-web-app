import { BusinessInfoForm } from '@/components/onboarding/business-info-form';

// UI-ONLY. The backend has no fleet-owner onboarding endpoint — the only
// onboarding routes that exist (lib/api/onboarding.ts) model a *driver*
// submission (license, national ID, live selfie), which has none of this
// screen's fields (company name, tax ID, business registration, owner ID).
// Nothing entered here is persisted; "Submit for Verification" only
// advances the wizard client-side. When a fleet-owner onboarding endpoint
// ships, wire submission here.
export default function OnboardingBusinessPage() {
  return <BusinessInfoForm />;
}
