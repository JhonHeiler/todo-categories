import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksPage } from './tasks.page';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { FeatureFlagsService } from '../../core/services/feature-flags.service';
import { of, BehaviorSubject } from 'rxjs';

class MockTaskService {
  private _list$ = new BehaviorSubject<any[]>([]);
  list$ = this._list$.asObservable();
  listByCategory$(){ return this.list$; }
  async create(){}
  async toggleDone(id: string){ this._list$.next(this._list$.value.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
  async remove(){}
  seed(list: any[]){ this._list$.next(list); }
}
class MockCategoryService { list$ = of([{id:'c1', name:'Cat'}]); }
class MockFF { getBoolean(){ return true; } ready$ = of(true); }

describe('TasksPage bulkComplete', () => {
  let fixture: ComponentFixture<TasksPage>;
  let page: TasksPage;
  let tasks: MockTaskService;
  beforeEach(async () => {
    tasks = new MockTaskService();
    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [
        { provide: TaskService, useValue: tasks },
        { provide: CategoryService, useClass: MockCategoryService },
        { provide: FeatureFlagsService, useClass: MockFF },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TasksPage);
    page = fixture.componentInstance;
    tasks.seed([
      { id: 'a', title:'a', done:false, categoryId: null, createdAt: Date.now() },
      { id: 'b', title:'b', done:false, categoryId: 'c1', createdAt: Date.now() },
      { id: 'c', title:'c', done:true,  categoryId: 'c1', createdAt: Date.now() },
    ]);
    fixture.detectChanges();
  });

  it('completes only visible pending tasks (all categories)', async () => {
    page.selectedCategoryId = null;
    await page.bulkComplete();
    const list = await firstValue<any[]>(tasks.list$);
    expect(list.filter(t => !t.done).length).toBe(0);
  });

  it('completes only visible pending tasks (specific category)', async () => {
    // reset
    tasks.seed([
      { id: 'a', title:'a', done:false, categoryId: null, createdAt: Date.now() },
      { id: 'b', title:'b', done:false, categoryId: 'c1', createdAt: Date.now() },
      { id: 'c', title:'c', done:true,  categoryId: 'c1', createdAt: Date.now() },
    ]);
    page.onCategoryChange({ detail: { value: 'c1' } });
    await page.bulkComplete();
    const list = await firstValue<any[]>(tasks.list$);
    const cat1 = list.filter(t => t.categoryId === 'c1');
    expect(cat1.every(t => t.done)).toBeTrue();
    const rest = list.filter(t => t.categoryId !== 'c1');
    expect(rest.some(t => !t.done)).toBeTrue();
  });
});

function firstValue<T>(obs:any): Promise<T>{ return import('rxjs').then(r=> r.firstValueFrom(obs as any) as any); }
