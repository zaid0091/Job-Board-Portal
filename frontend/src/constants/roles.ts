export const UserRole = {
  EMPLOYER: 'EMPLOYER',
  SEEKER: 'SEEKER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
