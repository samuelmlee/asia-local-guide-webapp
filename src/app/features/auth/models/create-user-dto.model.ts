export enum AuthProviderName {
  FIREBASE = 'FIREBASE',
}

export interface CreateUserDTO {
  providerUserId: string;
  providerName: AuthProviderName;
  email: string;
  name: string;
}
