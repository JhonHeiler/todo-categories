import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { StorageService } from './storage.service';

class MockStorageService {
  store = new Map<string, any>();
  async get<T>(k: string) { return this.store.get(k) ?? null; }
  async set<T>(k: string, v: T) { this.store.set(k, v); }
  async remove(k: string) { this.store.delete(k); }
}

describe('TaskService', () => {
  let service: TaskService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TaskService, { provide: StorageService, useClass: MockStorageService }] });
    service = TestBed.inject(TaskService);
  });

  it('should create and toggle and remove', async () => {
    await service.create('hola', null);
    const list1 = await firstValue<any[]>(service.list$);
    expect(list1.length).toBe(1);
    const id = list1[0].id;
    await service.toggleDone(id);
    const list2 = await firstValue<any[]>(service.list$);
    expect(list2[0].done).toBeTrue();
    await service.remove(id);
    const list3 = await firstValue<any[]>(service.list$);
    expect(list3.length).toBe(0);
  });
});

function firstValue<T>(obs: any): Promise<T> { return import('rxjs').then(r => r.firstValueFrom(obs as any)); }
