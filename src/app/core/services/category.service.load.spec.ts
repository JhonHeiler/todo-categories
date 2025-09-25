import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';
import { of } from 'rxjs';

class MockStorageService {
  store = new Map<string, any>();
  constructor(initial?: Record<string, any>) {
    if (initial) { for (const k of Object.keys(initial)) this.store.set(k, initial[k]); }
  }
  async get<T>(k: string){ return this.store.get(k) ?? null; }
  async set<T>(k: string, v: T){ this.store.set(k, v); }
}

describe('CategoryService load from storage', () => {
  it('initializes list from persisted categories', async () => {
    const categories = [{ id: 'c1', name: 'persisted', color: '#000' }];
    const storage = new MockStorageService({ categories });
    TestBed.configureTestingModule({ providers: [
      CategoryService,
      { provide: StorageService, useValue: storage },
      { provide: TaskService, useValue: { list$: of([]) } }
    ]});
    const svc = TestBed.inject(CategoryService);
    const list = await firstValue<any[]>(svc.list$);
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('persisted');
  });
});

function firstValue<T>(obs:any): Promise<T>{ return import('rxjs').then(r=> r.firstValueFrom(obs as any) as any); }
