import { Injectable } from '@angular/core';
import { StorageKey } from './storage.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  public save(key: StorageKey, value: any): void {
    value = JSON.stringify(value);
    this.storage.setItem(key, value);
  }

  public read(key: StorageKey): any {
    try {
      const value = this.storage.getItem(key);
      // @ts-ignore
      const parsed = JSON.parse(value);
      return parsed;
    } catch (e) {}
  }

  public remove(key: StorageKey): void {
    return this.storage.removeItem(key);
  }

  public clear(): void {
    this.storage.clear();
  }
}
