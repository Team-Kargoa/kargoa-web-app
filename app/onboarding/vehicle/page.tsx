import { getCategories } from '@/lib/api/vehicles';
import { VehicleSetupForm } from '@/components/onboarding/vehicle-setup-form';

// The category selector is LIVE (getCategories() below). Everything else on
// this screen is UI-ONLY: the backend has no fleet-owner onboarding
// endpoint. lib/api/onboarding.ts's submitDriver/getUploadUrl model a
// *driver* submission (license, national ID, live selfie, nested vehicle)
// with required fields this screen doesn't collect, so wiring them here
// would mean inventing payload data. Nothing entered here is persisted;
// "Finish Setup" only navigates to /fleet. When a fleet-owner onboarding
// endpoint ships, wire submission here.
export default async function OnboardingVehiclePage() {
  const categories = await getCategories();

  return <VehicleSetupForm categories={categories} />;
}
