import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { Task } from '../models/task.model';
import { StorageService } from './storage.service';
const KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private _tasks$ = new BehaviorSubject<Task[]>([]);
  readonly list$ = this._tasks$.asObservable();
  private loaded = false;
  constructor(private storage: StorageService) { this.load(); }
  private async load() {
    if (this.loaded) return;
    const data = await this.storage.get<Task[]>(KEY);
    if (Array.isArray(data) && data.length > 0) {
      this._tasks$.next(data);
    }
    this.loaded = true;
  }
  private async persist() { await this.storage.set(KEY, this._tasks$.value); }

  async create(title: string, categoryId?: string | null) {
    const t: Task = { id: uuid(), title, done: false, categoryId: categoryId ?? null, createdAt: Date.now() };
    this._tasks$.next([t, ...this._tasks$.value]); await this.persist();
  }
  async toggleDone(id: string) {
    this._tasks$.next(this._tasks$.value.map(t => t.id === id ? { ...t, done: !t.done } : t)); await this.persist();
  }
  async update(id: string, p: Partial<Task>) {
    this._tasks$.next(this._tasks$.value.map(t => t.id === id ? { ...t, ...p } : t)); await this.persist();
  }
  async remove(id: string) {
    this._tasks$.next(this._tasks$.value.filter(t => t.id !== id)); await this.persist();
  }
  listByCategory$(categoryId: string | null) {
    return this.list$.pipe(map(list => categoryId === null ? list : list.filter(t => t.categoryId === categoryId)));
  }
}
