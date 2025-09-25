import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';
import { TaskService } from './task.service';
const KEY = 'categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private _categories$ = new BehaviorSubject<Category[]>([]);
  readonly list$ = this._categories$.asObservable();
  private loaded = false;
  constructor(private storage: StorageService, private tasks: TaskService) { this.load(); }
  private async load() {
    if (this.loaded) return;
    const data = await this.storage.get<Category[]>(KEY);
    if (Array.isArray(data) && data.length > 0) {
      this._categories$.next(data);
    }
    this.loaded = true;
  }
  private async persist() { await this.storage.set(KEY, this._categories$.value); }

  async create(name: string, color?: string) {
    this._categories$.next([{ id: uuid(), name, color }, ...this._categories$.value]); await this.persist();
  }
  async update(id: string, p: Partial<Category>) {
    this._categories$.next(this._categories$.value.map(c => c.id === id ? { ...c, ...p } : c)); await this.persist();
  }
  async remove(id: string) {
    const tasks = await firstValueFrom(this.tasks.list$);
    if (tasks?.some(t => t.categoryId === id)) throw new Error('No se puede eliminar: hay tareas usando esta categoría');
    this._categories$.next(this._categories$.value.filter(c => c.id !== id)); await this.persist();
  }
}
