import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export class AuthMiddleware {
  static async validate(req: NextRequest): Promise<Response | null> {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
  }
}

type NextApiHandler = (request: Request) => Promise<Response>;

export const withAuth = (handler: NextApiHandler): NextApiHandler => {
  return async (request: Request) => {
    const { userId } = getAuth(request as unknown as NextRequest);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request);
  };
};
