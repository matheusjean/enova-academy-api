export class CacheMock {
  store = new Map<string, any>();
  async get<T>(k: string) {
    return this.store.get(k) as T;
  }
  async set(k: string, v: any) {
    this.store.set(k, v);
  }
  async del(k: string) {
    this.store.delete(k);
  }
}
