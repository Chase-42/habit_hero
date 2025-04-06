import { toast } from "sonner";

export class NotificationService {
  success(message: string): void {
    toast.success(message);
  }

  error(message: string): void {
    toast.error(message);
  }

  handleError(error: unknown): void {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    this.error(message);
  }
}
