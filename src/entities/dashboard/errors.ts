export class DashboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardError";
  }
}

export class DashboardStatsError extends DashboardError {
  constructor(message: string) {
    super(message);
    this.name = "DashboardStatsError";
  }
}

export class DashboardDataError extends DashboardError {
  constructor(message: string) {
    super(message);
    this.name = "DashboardDataError";
  }
}
