import { Role } from 'modules/role/role.service';

export type UserResponse = {
  token: string;
  access_token?: string;
  expires_in: number;
  created_at?: string;
  id: number;
  email: string;
  menu_items: MenuGroup[];
  permissions: Permission[];
  roles: Role[];
};

export type MenuItem = {
  id: number;
  label: string;
  url: string | null;
  icon?: string | null;
  order?: number | null;
};

export type MenuGroup = {
  id: number;
  label: string;
  icon: string;
  url?: string;
  children: MenuItem[];
};

export type Permission = {
  id: number;
  name: string;
  resource: string;
  action: string;
};
