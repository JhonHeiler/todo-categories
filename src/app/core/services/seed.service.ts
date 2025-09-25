import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CategoryService } from './category.service';
import { TaskService } from './task.service';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private key = 'seed:v1';
  constructor(private storage: StorageService, private cats: CategoryService, private tasks: TaskService) {}

  async runOnce() {
    const done = await this.storage.get<boolean>(this.key);
    if (done) return;
    // Seed categories
    await this.cats.create('Trabajo', '#1e90ff');
    await this.cats.create('Hogar', '#32cd32');
    await this.cats.create('Estudio', '#ffa500');
    const list = await import('rxjs').then(r => r.firstValueFrom(this.cats.list$));
    const byName = (n: string) => list.find(c => c.name === n)?.id ?? null;
    // Seed tasks (2 done, 2 pending)
    await this.tasks.create('Enviar informe semanal', byName('Trabajo'));
    await this.tasks.create('Limpiar cocina', byName('Hogar'));
    await this.tasks.create('Repasar notas de Angular', byName('Estudio'));
    await this.tasks.create('Pagar facturas', byName('Hogar'));
    // Mark two as done
    const tlist = await import('rxjs').then(r => r.firstValueFrom(this.tasks.list$));
    const toComplete = tlist.slice(0, 2);
    for (const t of toComplete) await this.tasks.toggleDone(t.id);
    await this.storage.set(this.key, true);
  }
}
