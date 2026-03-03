export interface CardLabel {
  name: string;
  description: string;
}

export interface DashboardDataCard {
  id: number;
  name: string;
  label: CardLabel;
  amount: string;
  icon: string;
  status: string;
  bgColor: string;
}

export const cardData: DashboardDataCard[] = [
  {
    id: 1,
    name: 'Total Facilities Registered',
    amount: '500,301',
    icon: 'search',
    bgColor: 'bg-red-500',
    status: 'up',
    label: {
      name: 'Total Facilities Registered',
      description: 'vs last quarter 221,420',
    },
  },
  {
    id: 2,
    name: 'Total Active Facilities',
    amount: '6,500',
    icon: 'attach_money',
    bgColor: 'bg-blue-500',
    status: 'down',
    label: {
      name: 'Total Active Facilities',
      description: 'vs last quarter 80,000',
    },
  },
  {
    id: 3,
    name: 'Total Companies',
    amount: '20,500',
    icon: 'local_florist',
    bgColor: 'bg-green-500',
    status: 'up',
    label: {
      name: 'Total Companies',
      description: 'vs last quarter 20,000',
    },
  },
  {
    id: 4,
    name: 'Total Users',
    amount: '210,500',
    icon: 'emoji_people',
    bgColor: 'bg-green-500',
    status: 'up',
    label: {
      name: 'Total Users',
      description: 'vs last quarter 205,000',
    },
  },
];

export const facilityCardData: DashboardDataCard[] = [
  {
    id: 2,
    name: 'Total Infrastructure',
    amount: '6,500',
    icon: 'attach_money',
    bgColor: 'bg-blue-500',
    status: 'down',
    label: {
      name: 'Total Infrastructure',
      description: 'vs last quarter 80,000',
    },
  },
  {
    id: 3,
    name: 'Total Staff',
    amount: '20,500',
    icon: 'local_florist',
    bgColor: 'bg-green-500',
    status: 'up',
    label: {
      name: 'Total Staff',
      description: 'vs last quarter 20,000',
    },
  },
  {
    id: 4,
    name: 'Equipments Registered',
    amount: '210,500',
    icon: 'emoji_people',
    bgColor: 'bg-green-500',
    status: 'up',
    label: {
      name: 'Equipments Registered',
      description: 'vs last quarter 205,000',
    },
  },
];

export const orderCardData: DashboardDataCard[] = [
  {
    id: 2,
    name: 'Total Infrastructure',
    amount: '6,500',
    icon: 'attach_money',
    bgColor: 'bg-blue-500',
    status: 'down',
    label: {
      name: 'Total Infrastructure',
      description: 'vs last quarter 80,000',
    },
  },
  {
    id: 3,
    name: 'Total Staff',
    amount: '20,500',
    icon: 'local_florist',
    bgColor: 'bg-green-500',
    status: 'up',
    label: {
      name: 'Total Staff',
      description: 'vs last quarter 20,000',
    },
  },
  {
    id: 4,
    name: 'Equipments Registered',
    amount: '210,500',
    icon: 'emoji_people',
    bgColor: 'bg-green-500',
    status: 'up',
    label: {
      name: 'Equipments Registered',
      description: 'vs last quarter 205,000',
    },
  },
];
