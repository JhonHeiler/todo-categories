import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';

class MockStorageService { store = new Map<string, any>(); async get<T>(k: string){return this.store.get(k)??null;} async set<T>(k:string,v:T){this.store.set(k,v);} }
class MockTaskService { list$ = Promise.resolve([]) as any; }

describe('CategoryService', () => {
  let service: CategoryService;
  let tasks: MockTaskService;
  beforeEach(() => {
    tasks = new MockTaskService();
    TestBed.configureTestingModule({ providers: [CategoryService, { provide: StorageService, useClass: MockStorageService }, { provide: TaskService, useValue: tasks }] });
    service = TestBed.inject(CategoryService);
  });

  it('should create, update and remove', async () => {
    await service.create('Work', '#000');
    const list1 = await firstValue<any[]>(service.list$);
    expect(list1.length).toBe(1);
    const id = list1[0].id;
    await service.update(id, { name: 'Job' });
    const list2 = await firstValue<any[]>(service.list$);
    expect(list2[0].name).toBe('Job');
    (tasks as any).list$ = fromValue([{ id: 't1', title: 'a', done: false, categoryId: id, createdAt: Date.now() }]);
    await expectAsync(service.remove(id)).toBeRejected();
  });
});

function firstValue<T>(obs: any): Promise<T> { return import('rxjs').then(r => r.firstValueFrom(obs as any)); }
function fromValue<T>(v: T) { return { subscribe: (fn: any) => { fn(v); return { unsubscribe(){} }; } } as any; }
