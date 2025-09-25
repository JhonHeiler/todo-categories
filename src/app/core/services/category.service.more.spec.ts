import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';

class MockStorageService { store = new Map<string, any>(); async get<T>(k:string){return this.store.get(k)??null;} async set<T>(k:string,v:T){this.store.set(k,v);} }
import { of } from 'rxjs';
class MockTaskService { list$ = of([]) as any; }

describe('CategoryService remove without usage', () => {
  let svc: CategoryService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CategoryService, { provide: StorageService, useClass: MockStorageService }, { provide: TaskService, useClass: MockTaskService }] });
    svc = TestBed.inject(CategoryService);
  });

  it('removes when no task uses the category', async () => {
    await svc.create('Temp', '#fff');
    const list1 = await firstValue<any[]>(svc.list$);
    const id = list1[0].id;
    await svc.remove(id);
    const list2 = await firstValue<any[]>(svc.list$);
    expect(list2.find(c => c.id === id)).toBeUndefined();
  });
});

function firstValue<T>(obs:any): Promise<T>{ return import('rxjs').then(r=> r.firstValueFrom(obs as any) as any); }
