export type Envelope<T> = {
  status: 'success' | 'error';
  data: T;
  message: string;
};

export type Role = 'customer' | 'driver' | 'fleet_owner' | 'admin';
export type OtpPurpose = 'registration' | 'login';

export type UserSummary = {
  id: string;
  phone_number: string;
  role: Role;
  full_name: string;
  profile_photo: string | null;
  is_active: boolean;
  date_joined: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  user: UserSummary;
};

export type OtpRequestResult = {
  dev_otp?: string;
};

export type VehicleCategory = {
  id: string;
  name: string;
  description: string;
  base_fare: string;
  per_km_rate: string;
  minimum_fare: string;
  is_active: boolean;
};
