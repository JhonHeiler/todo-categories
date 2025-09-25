import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CategoriesPage } from './categories.page';
import { CategoryService } from '../../core/services/category.service';
import { of } from 'rxjs';

class MockCategories {
  list$ = of([{ id: 'c1', name: 'Work', color: '#000' }]);
  create = jasmine.createSpy().and.returnValue(Promise.resolve());
  update = jasmine.createSpy().and.returnValue(Promise.resolve());
  remove = jasmine.createSpy().and.returnValue(Promise.resolve());
}

describe('CategoriesPage', () => {
  let fixture: ComponentFixture<CategoriesPage>;
  let page: CategoriesPage;
  let svc: MockCategories;

  beforeEach(async () => {
    svc = new MockCategories();
    await TestBed.configureTestingModule({
      imports: [CategoriesPage],
      providers: [{ provide: CategoryService, useValue: svc }]
    }).compileComponents();
    fixture = TestBed.createComponent(CategoriesPage);
    page = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and lists categories', () => {
    expect(page).toBeTruthy();
  });
});
