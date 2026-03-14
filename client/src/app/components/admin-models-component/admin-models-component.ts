import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModelService } from '../../services/model-service';
import { DressService } from '../../services/dress-service';
import { CategoryService } from '../../services/category-service';
import { UserService } from '../../services/user-service';
import { AlertService } from '../../services/alert-service';
import { ModelModel } from '../../models/model.model';
import { DressModel } from '../../models/dress.model';
import { CategoryModel } from '../../models/category.model';
import { ModelCardComponent } from '../model-card-component/model-card-component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-admin-models',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, DialogModule, InputNumberModule, ProgressSpinnerModule, ModelCardComponent, TableModule, MultiSelectModule, PaginatorModule],
  templateUrl: './admin-models-component.html',
  styleUrl: './admin-models-component.scss',
})
export class AdminModelsComponent implements OnInit {
  private modelService = inject(ModelService);
  private dressService = inject(DressService);
  private categoryService = inject(CategoryService);
  private userService = inject(UserService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  models = signal<ModelModel[]>([]);
  categories = signal<CategoryModel[]>([]);
  loading = signal(true);
  searchQuery = '';
  allModels: ModelModel[] = [];
  pagedModels: ModelModel[] = [];
  pageSize = 12;
  pageIndex = 0;
  
  editDialog = signal(false);
  deleteDialog = signal(false);
  actionDialog = signal(false);
  dressDialog = signal(false);
  editingModel: ModelModel | null = null;
  deletingModel: ModelModel | null = null;
  selectedModel: ModelModel | null = null;
  addingModel = false;
  
  dresses = signal<DressModel[]>([]);
  editingDress: DressModel | null = null;
  deletingDress: DressModel | null = null;
  addingDress = false;
  tempDresses: Array<{size: string, price: number, note?: string}> = [];
 
    ngOnInit(): void {
    const user = this.userService.currentUser();
    if (!user) {
      this.alertService.show('יש להתחבר למערכת לפני ההמשך', 'error');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.userService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadModels();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('שגיאה בטעינת קטגוריות:', err);
      }
    });
  }

  loadModels(): void {
    this.loading.set(true);
    this.searchQuery = '';
    
    this.modelService.getModels(undefined, undefined, undefined, undefined, undefined, 1, 100).subscribe({
      next: (data) => {
        this.allModels = data.items;
        this.models.set(data.items);
        this.pageIndex = 0;
        this.updatePagedModels();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  searchModels(): void {
    if (!this.searchQuery.trim()) {
      this.models.set(this.allModels);
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    const filtered = this.allModels.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query)
    );
    this.models.set(filtered);
    this.pageIndex = 0;
    this.updatePagedModels();
  }

  onPageChange(event: PaginatorState): void {
    this.pageIndex = event.page ?? 0;
    this.pageSize = event.rows ?? this.pageSize;
    this.updatePagedModels();
  }

  private updatePagedModels(): void {
    const source = this.models();
    const start = this.pageIndex * this.pageSize;
    if (start >= source.length) {
      this.pageIndex = 0;
    }
    const newStart = this.pageIndex * this.pageSize;
    this.pagedModels = source.slice(newStart, newStart + this.pageSize);
  }

  openActionDialog(model: ModelModel): void {
    this.selectedModel = model;
    this.actionDialog.set(true);
  }

  confirmEdit(): void {
    this.actionDialog.set(false);
    if (this.selectedModel) {
      this.openEditDialog(this.selectedModel);
    }
  }

  confirmDeleteFromAction(): void {
    this.actionDialog.set(false);
    if (this.selectedModel) {
      this.openDeleteDialog(this.selectedModel);
    }
  }

  openEditDialog(model: ModelModel): void {
    this.addingModel = false;
    this.editingModel = { ...model };
    this.loadDresses(model.id);
    this.editDialog.set(true);
  }

  openAddModel(): void {
    this.addingModel = true;
    this.editingModel = {
      id: 0,
      name: '',
      description: '',
      imgUrl: '',
      basePrice: 0,
      color: '',
      isActive: true,
      categories: []
    };
    this.dresses.set([]);
    this.tempDresses = [];
    this.editDialog.set(true);
  }

  loadDresses(modelId: number): void {
    this.dressService.getDressesByModelId(modelId).subscribe({
      next: (dresses) => {
        this.dresses.set(dresses);
      },
      error: (err) => {
        console.error('שגיאה בטעינת שמלות:', err);
        this.dresses.set([]);
      }
    });
  }

  openAddDress(): void {
    this.addingDress = true;
    this.editingDress = {
      id: 0,
      modelName: this.editingModel!.name,
      size: '',
      price: this.editingModel!.basePrice || 0,
      note: '',
      modelImgUrl: this.editingModel!.imgUrl
    };
  }

  openEditDress(dress: DressModel): void {
    this.addingDress = false;
    this.editingDress = { ...dress };
  }

  saveDress(): void {
    if (!this.editingDress) return;

    const dressData = {
      modelId: this.editingModel!.id,
      size: this.editingDress.size,
      price: this.editingDress.price,
      note: this.editingDress.note || ''
    };

    if (this.addingDress) {
      this.dressService.addDress(dressData).subscribe({
        next: () => {
          this.loadDresses(this.editingModel!.id);
          this.editingDress = null;
        },
        error: (err) => console.error('שגיאה בהוספת שמלה:', err)
      });
    } else {
      this.dressService.updateDress(this.editingDress.id, dressData).subscribe({
        next: () => {
          this.loadDresses(this.editingModel!.id);
          this.editingDress = null;
        },
        error: (err) => console.error('שגיאה בעדכון שמלה:', err)
      });
    }
  }

  saveDressToList(): void {
    if (!this.editingDress || !this.editingDress.size) {
      alert('חובה למלא מידה');
      return;
    }

    if (this.addingModel) {
      this.tempDresses.push({
        size: this.editingDress.size,
        price: this.editingDress.price,
        note: this.editingDress.note
      });
      this.editingDress = null;
    } else {
      this.saveDress();
    }
  }

  cancelDressEdit(): void {
    this.editingDress = null;
  }

  removeTempDress(index: number): void {
    this.tempDresses.splice(index, 1);
  }

  confirmDeleteDress(dress: DressModel): void {
    if (confirm(`האם למחוק שמלה במידה ${dress.size}?`)) {
      this.dressService.deleteDress(dress.id).subscribe({
        next: () => this.loadDresses(this.editingModel!.id),
        error: (err) => console.error('שגיאה במחיקת שמלה:', err)
      });
    }
  }

  openDeleteDialog(model: ModelModel): void {
    this.deletingModel = model;
    this.deleteDialog.set(true);
  }

  saveModel(): void {
    if (!this.editingModel) return;
    
    if (!this.editingModel.categories || this.editingModel.categories.length === 0) {
      alert('חובה לבחור לפחות קטגוריה אחת');
      return;
    }

    const updateData = {
      name: this.editingModel.name,
      description: this.editingModel.description,
      imgUrl: this.editingModel.imgUrl,
      basePrice: this.editingModel.basePrice,
      color: this.editingModel.color,
      categoriesId: this.editingModel.categories.map(c => c.id)
    };
    
    if (this.addingModel) {
      this.modelService.addModel(updateData).subscribe({
        next: (newModel) => {
          if (this.tempDresses.length > 0) {
            this.saveTempDresses(newModel.id);
          } else {
            this.editDialog.set(false);
            this.loadModels();
          }
        },
        error: (err) => {
          console.error('שגיאה בהוספת מודל:', err);
          alert('שגיאה בהוספת מודל: ' + (err.error || err.message));
        }
      });
    } else {
      this.modelService.updateModel(this.editingModel.id, updateData).subscribe({
        next: () => {
          this.editDialog.set(false);
          this.loadModels();
        },
        error: (err) => {
          console.error('שגיאה בעדכון מודל:', err);
          alert('שגיאה בעדכון מודל: ' + (err.error || err.message));
        }
      });
    }
  }

  saveTempDresses(modelId: number): void {
    let completed = 0;
    const total = this.tempDresses.length;

    this.tempDresses.forEach(dress => {
      const dressData = {
        modelId: modelId,
        size: dress.size,
        price: dress.price,
        note: dress.note || ''
      };

      this.dressService.addDress(dressData).subscribe({
        next: () => {
          completed++;
          if (completed === total) {
            this.editDialog.set(false);
            this.loadModels();
            this.tempDresses = [];
          }
        },
        error: (err) => {
          console.error('שגיאה בהוספת שמלה:', err);
          completed++;
          if (completed === total) {
            this.editDialog.set(false);
            this.loadModels();
            this.tempDresses = [];
          }
        }
      });
    });
  }

  confirmDelete(): void {
    if (!this.deletingModel) return;
    
    this.modelService.deleteModel(this.deletingModel.id).subscribe({
      next: () => {
        this.deleteDialog.set(false);
        this.loadModels();
      },
      error: (err) => {
        console.error('שגיאה במחיקת מודל:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}