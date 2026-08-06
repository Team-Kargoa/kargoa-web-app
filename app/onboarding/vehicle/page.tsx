import { getCategories } from '@/lib/api/vehicles';
import { VehicleSetupForm } from '@/components/onboarding/vehicle-setup-form';

export default async function OnboardingVehiclePage() {
  const categories = await getCategories();

  return <VehicleSetupForm categories={categories} />;
}
