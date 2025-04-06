import { auth } from "@clerk/nextjs/server";
import { type AuthService } from "~/application/services/auth-service";

export class ClerkAuthService implements AuthService {
  async getCurrentUser() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
  }

  async isAuthenticated() {
    const { userId } = await auth();
    return !!userId;
  }
}
