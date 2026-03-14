import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminModelsComponent } from './admin-models-component';

describe('AdminModelsComponent', () => {
  let component: AdminModelsComponent;
  let fixture: ComponentFixture<AdminModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminModelsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
