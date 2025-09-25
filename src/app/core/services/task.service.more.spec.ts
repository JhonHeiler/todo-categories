import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { StorageService } from './storage.service';

class MockStorageService { store = new Map<string, any>(); async get<T>(k:string){return this.store.get(k)??null;} async set<T>(k:string,v:T){this.store.set(k,v);} }

describe('TaskService more coverage', () => {
  let svc: TaskService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TaskService, { provide: StorageService, useClass: MockStorageService }] });
    svc = TestBed.inject(TaskService);
  });

  it('update should modify fields', async () => {
    await svc.create('uno', null);
    const list1 = await firstValue<any[]>(svc.list$);
    const id = list1[0].id;
    await svc.update(id, { title: 'dos' });
    const list2 = await firstValue<any[]>(svc.list$);
    expect(list2[0].title).toBe('dos');
  });

  it('listByCategory$ filters correctly for id and null', async () => {
    await svc.create('a', 'cat1');
    await svc.create('b', 'cat2');
    await svc.create('c', null);
    const onlyCat1 = await firstValue<any[]>(svc.listByCategory$('cat1'));
    expect(onlyCat1.every((t: any) => t.categoryId === 'cat1')).toBeTrue();
    const all = await firstValue<any[]>(svc.listByCategory$(null));
    expect(all.length).toBeGreaterThanOrEqual(3);
  });
});

function firstValue<T>(obs:any): Promise<T>{ return import('rxjs').then(r=> r.firstValueFrom(obs as any) as any); }
