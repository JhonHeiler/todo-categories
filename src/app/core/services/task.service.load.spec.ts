import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { StorageService } from './storage.service';

class MockStorageService {
  store = new Map<string, any>();
  constructor(initial?: Record<string, any>) {
    if (initial) { for (const k of Object.keys(initial)) this.store.set(k, initial[k]); }
  }
  async get<T>(k: string){ return this.store.get(k) ?? null; }
  async set<T>(k: string, v: T){ this.store.set(k, v); }
}

describe('TaskService load from storage', () => {
  it('initializes list from persisted tasks', async () => {
    const tasks = [{ id: '1', title: 'persisted', done: false, categoryId: null, createdAt: Date.now() }];
    const storage = new MockStorageService({ tasks });
    TestBed.configureTestingModule({ providers: [
      TaskService,
      { provide: StorageService, useValue: storage }
    ]});
    const svc = TestBed.inject(TaskService);
    const list = await firstValue<any[]>(svc.list$);
    expect(list.length).toBe(1);
    expect(list[0].title).toBe('persisted');
  });
});

function firstValue<T>(obs:any): Promise<T>{ return import('rxjs').then(r=> r.firstValueFrom(obs as any) as any); }
