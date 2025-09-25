import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksPage } from './tasks.page';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { FeatureFlagsService } from '../../core/services/feature-flags.service';
import { of } from 'rxjs';

class MockTaskService { list$ = of([]); listByCategory$(){ return this.list$; } create(){return Promise.resolve();} toggleDone(){return Promise.resolve();} remove(){return Promise.resolve();} }
class MockCategoryService { list$ = of([{id:'a', name:'A'}]); }
class MockFF { bool(){ return false; } getBoolean(){ return false; } ready$ = of(true); }

describe('TasksPage onCategoryChange', () => {
  let fixture: ComponentFixture<TasksPage>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksPage],
      providers: [
        { provide: TaskService, useClass: MockTaskService },
        { provide: CategoryService, useClass: MockCategoryService },
        { provide: FeatureFlagsService, useClass: MockFF },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TasksPage);
    fixture.detectChanges();
  });

  it('casts null and string "null" to null', () => {
    const comp = fixture.componentInstance;
    comp.onCategoryChange({ detail: { value: null } });
    expect(comp.selectedCategoryId).toBeNull();
    comp.onCategoryChange({ detail: { value: 'null' } });
    expect(comp.selectedCategoryId).toBeNull();
  });
});
