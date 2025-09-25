import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CategoryService } from '../../core/services/category.service';

@Component({
  standalone: true,
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './categories.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  cats = inject(CategoryService);
  toast = inject(ToastController);
  alert = inject(AlertController);

  newName = '';
  newColor = '#3880ff';
  trackById = (_: number, c: any) => c.id;

  async add() {
    const name = this.newName.trim();
    if (!name) return;
    await this.cats.create(name, this.newColor);
    this.newName = '';
  }

  async rename(id: string, current: string) {
    const a = await this.alert.create({
      header: 'Renombrar categoría',
      inputs: [{ name: 'name', type: 'text', value: current }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Guardar', role: 'confirm' },
      ],
    });
    await a.present();
    const r = await a.onDidDismiss();
    if (r.role === 'confirm') {
      const name = (r.data?.values?.name ?? '').trim();
      if (name) await this.cats.update(id, { name });
    }
  }

  async remove(id: string) {
    try {
      await this.cats.remove(id);
    } catch (e: any) {
      const t = await this.toast.create({ message: e?.message ?? 'No se pudo eliminar', color: 'warning', duration: 2500 });
      await t.present();
    }
  }
}
