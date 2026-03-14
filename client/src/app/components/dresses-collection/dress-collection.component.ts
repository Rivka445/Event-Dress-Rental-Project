import { Component } from '@angular/core';
import { ListModelsComponent } from '../list-models-component/list-models-component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ListModelsComponent],
  template: `<app-list-models-component></app-list-models-component>`
})
export class DressComponent {}