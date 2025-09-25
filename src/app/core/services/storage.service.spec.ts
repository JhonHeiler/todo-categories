import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { Storage } from '@ionic/storage-angular';

class MockStorage implements Partial<Storage> {
  private store = new Map<string, any>();
  create(){ return Promise.resolve(this as unknown as Storage); }
  async get(key: string){ return this.store.get(key); }
  async set(key: string, value: any){ this.store.set(key, value); }
  async remove(key: string){ this.store.delete(key); }
}

describe('StorageService', () => {
  let svc: StorageService;
  let backing: MockStorage;
  beforeEach(() => {
    backing = new MockStorage();
    TestBed.configureTestingModule({ providers: [
      StorageService,
      { provide: Storage, useValue: backing }
    ]});
    svc = TestBed.inject(StorageService);
  });

  it('get returns null when key is missing and value when present', async () => {
    const missing = await svc.get('nope');
    expect(missing).toBeNull();
    await svc.set('k', 123);
    const v = await svc.get('k');
    expect(v).toBe(123);
    await svc.remove('k');
    const after = await svc.get('k');
    expect(after).toBeNull();
  });
});
