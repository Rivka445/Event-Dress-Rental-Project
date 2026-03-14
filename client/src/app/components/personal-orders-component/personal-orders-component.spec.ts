import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalOrdersComponent } from './personal-orders-component';

describe('PersonalOrdersComponent', () => {
  let component: PersonalOrdersComponent;
  let fixture: ComponentFixture<PersonalOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalOrdersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
