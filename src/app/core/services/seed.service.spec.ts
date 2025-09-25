import { TestBed } from '@angular/core/testing';
import { SeedService } from './seed.service';
import { StorageService } from './storage.service';
import { CategoryService } from './category.service';
import { TaskService } from './task.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

class MockStorageService {
  store = new Map<string, any>();
  async get<T>(k: string){ return this.store.get(k) ?? null; }
  async set<T>(k: string, v: T){ this.store.set(k, v); }
}

class MockCategoryService {
  private _list$ = new BehaviorSubject<any[]>([]);
  list$ = this._list$.asObservable();
  async create(name: string, color?: string){ this._list$.next([{ id: name, name, color }, ...this._list$.value]); }
}

class MockTaskService {
  private _list$ = new BehaviorSubject<any[]>([]);
  list$ = this._list$.asObservable();
  async create(title: string, categoryId?: string | null){ this._list$.next([{ id: title, title, done: false, categoryId: categoryId ?? null, createdAt: Date.now() }, ...this._list$.value]); }
  async toggleDone(id: string){ this._list$.next(this._list$.value.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
}

describe('SeedService', () => {
  let seed: SeedService;
  let storage: MockStorageService;
  let cats: MockCategoryService;
  let tasks: MockTaskService;

  beforeEach(() => {
    storage = new MockStorageService();
    cats = new MockCategoryService();
    tasks = new MockTaskService();
    TestBed.configureTestingModule({ providers: [
      SeedService,
      { provide: StorageService, useValue: storage },
      { provide: CategoryService, useValue: cats },
      { provide: TaskService, useValue: tasks }
    ]});
    seed = TestBed.inject(SeedService);
  });

  it('seeds data only once', async () => {
    await seed.runOnce();
  const catList1 = await firstValueFrom(cats.list$);
  const taskList1 = await firstValueFrom(tasks.list$);
    expect(catList1.length).toBeGreaterThanOrEqual(3);
    expect(taskList1.length).toBeGreaterThanOrEqual(4);
    const doneCount = taskList1.filter(t => t.done).length;
    expect(doneCount).toBe(2);
    await seed.runOnce();
    const catList2 = await firstValueFrom(cats.list$);
    const taskList2 = await firstValueFrom(tasks.list$);
    expect(catList2.length).toBe(catList1.length);
    expect(taskList2.length).toBe(taskList1.length);
  });
});
