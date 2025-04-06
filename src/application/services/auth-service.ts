export interface AuthService {
  getCurrentUser(): Promise<string>;
  isAuthenticated(): Promise<boolean>;
}
