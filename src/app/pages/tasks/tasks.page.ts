import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { FeatureFlagsService } from '../../core/services/feature-flags.service';

@Component({
  standalone: true, selector: 'app-tasks',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './tasks.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksPage {
  tasks = inject(TaskService);
  cats = inject(CategoryService);
  ff = inject(FeatureFlagsService);

  newTitle = '';
  selectedCategoryId: string | null = null;
  list$ = this.tasks.listByCategory$(this.selectedCategoryId);
  trackById = (_: number, t: any) => t.id;

  onCategoryChange(ev: any) {
    const v = ev?.detail?.value;
    this.selectedCategoryId = (v === null || v === 'null' || v === undefined) ? null : v;
    this.list$ = this.tasks.listByCategory$(this.selectedCategoryId);
  }

  async add() { if (!this.newTitle.trim()) return; await this.tasks.create(this.newTitle.trim(), this.selectedCategoryId); this.newTitle=''; }
  async toggle(id: string) { await this.tasks.toggleDone(id); }
  async remove(id: string) { await this.tasks.remove(id); }
  async bulkComplete() {
    const { firstValueFrom } = await import('rxjs');
    const list = await firstValueFrom(this.tasks.list$);
    const visible = (list ?? []).filter(t => !t.done && (this.selectedCategoryId ? t.categoryId === this.selectedCategoryId : true));
    for (const t of visible) await this.tasks.toggleDone(t.id);
  }
}
