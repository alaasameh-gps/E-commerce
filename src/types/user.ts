export type UserRole = "user" | "admin";

export type User = {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};
