export type WeeklyRow = {
  short: string;
  label: string;
  from?: string;
  to?: string;
  unavailable?: boolean;
};

export type EventType = {
  id: number;
  name: string;
  duration: string;
  location: string;
  selected: boolean;
};


