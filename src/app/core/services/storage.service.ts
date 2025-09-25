import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private ready = this.storage.create();
  constructor(private storage: Storage) {}
  async get<T>(k: string) { await this.ready; return (await this.storage.get(k)) ?? null; }
  async set<T>(k: string, v: T) { await this.ready; await this.storage.set(k, v); }
  async remove(k: string) { await this.ready; await this.storage.remove(k); }
}
