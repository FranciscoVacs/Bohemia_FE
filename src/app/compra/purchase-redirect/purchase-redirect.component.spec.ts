import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseRedirectComponent } from './purchase-redirect.component';

describe('PurchaseRedirectComponent', () => {
  let component: PurchaseRedirectComponent;
  let fixture: ComponentFixture<PurchaseRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
