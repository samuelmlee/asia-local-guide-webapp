export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  roles: string[];
  createdAt?: Date;
  lastLoginAt?: Date;
}
