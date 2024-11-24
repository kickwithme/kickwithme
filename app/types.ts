export type Role = 'JL' | 'TI' | 'CI' | 'Admin';

export type User = {
  username: string;
  role: Role;
  phone?: string;
  email?: string;
  password?: string;
  signupPreferences?: {
    lead: boolean;
    desk: boolean;
    assist: boolean;
  };
};

export type ClassSignUp = {
  username: string;
  role: Role;
  position: 'lead' | 'desk' | 'assist';
};

export type ClassInfo = {
  id: string;
  startTime: number;
  endTime: number;
  type: string;
  subvariant?: string;
  customVariant?: string;
  color: string;
  lead: ClassSignUp[];
  desk: ClassSignUp[];
  assist: ClassSignUp[];
  availablePositions: {
    lead: boolean;
    desk: boolean;
    assist: boolean;
  };
};

export type UserSignup = {
  username: string;
  date: string;
  time: string;
  class: string;
  role: 'lead' | 'desk' | 'assist';
};

export type EventColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type Event = {
  id: string;
  date: string;
  color: EventColor;
  type: string;
  customText?: string;
  description?: string;
};

export type CalendarEvent = {
  [date: string]: Event;
};

