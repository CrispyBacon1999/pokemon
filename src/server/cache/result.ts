export interface ICacheResult<T> {
  data: T;
  etag: string;
  matchesCache: boolean;
  recommendedRefetchInMs: number;
  lastUpdated: Date;
  stale: boolean;
}