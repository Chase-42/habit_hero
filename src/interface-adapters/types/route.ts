export interface RouteContext<T = string> {
  params: T extends Promise<unknown>
    ? T
    : {
        id: T;
      };
}

export interface RouteSearchParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  isActive?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RouteParams {
  id: string;
}
