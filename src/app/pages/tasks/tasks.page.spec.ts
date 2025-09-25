import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TasksPage } from './tasks.page';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { FeatureFlagsService } from '../../core/services/feature-flags.service';
import { of } from 'rxjs';

class MockTaskService {
  list$ = of([]);
  listByCategory$(){ return this.list$; }
  create(){ return Promise.resolve(); }
  toggleDone(){ return Promise.resolve(); }
  remove(){ return Promise.resolve(); }
}
class MockCategoryService { list$ = of([]); }
class MockFF { bool(){ return true; } getBoolean(){ return true; } ready$ = of(true); }

describe('TasksPage', () => {
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

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
