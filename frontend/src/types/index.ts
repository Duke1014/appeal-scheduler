export type UserRole = 'volunteer' | 'employee' | 'admin';
export type ShowType = 'evening' | 'matinee';
export type EventStatus = 'scheduled' | 'active' | 'cancelled' | 'completed' | 'postponed';
export type VolunteerLocation = 'uptown' | 'downtown';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  photo_path: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Assignment {
  id: number;
  name: string;
  uses_tech_devices: boolean;
  notes: string | null;
  volunteers: User[];
}

export interface Event {
  id: number;
  name: string;
  show_type: ShowType;
  location: string;
  status: EventStatus;
  event_date: string | null;
  assignments: Assignment[];
  created_at: string;
  updated_at: string;
}

export interface Survey {
  id: number;
  user_id: number;
  week_start: string;
  available_slots: string | null;
  preferred_location: VolunteerLocation | null;
  additional_volunteers: number;
  notes: string | null;
  submitted_at: string;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  registration_code: string;
  photo?: FileList;
}

export interface SurveyFormData {
  week_start: string;
  available_slots: string[];
  preferred_location?: VolunteerLocation;
  additional_volunteers: number;
  notes?: string;
}

export const AVAILABILITY_SLOTS = [
  { key: 'monday_morning',    label: 'Mon Morning' },
  { key: 'monday_evening',    label: 'Mon Evening' },
  { key: 'tuesday_morning',   label: 'Tue Morning' },
  { key: 'tuesday_evening',   label: 'Tue Evening' },
  { key: 'wednesday_morning', label: 'Wed Morning' },
  { key: 'wednesday_evening', label: 'Wed Evening' },
  { key: 'thursday_morning',  label: 'Thu Morning' },
  { key: 'thursday_evening',  label: 'Thu Evening' },
  { key: 'friday_morning',    label: 'Fri Morning' },
  { key: 'friday_evening',    label: 'Fri Evening' },
  { key: 'saturday_morning',  label: 'Sat Morning' },
  { key: 'saturday_evening',  label: 'Sat Evening' },
  { key: 'sunday_morning',    label: 'Sun Morning' },
  { key: 'sunday_evening',    label: 'Sun Evening' },
] as const;