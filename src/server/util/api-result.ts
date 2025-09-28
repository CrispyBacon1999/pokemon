export interface IApiResult<T> {
  data: T;
  etag: string;
}