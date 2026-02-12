import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendeesDataComponent } from './attendees-data.component';

describe('AttendeesDataComponent', () => {
  let component: AttendeesDataComponent;
  let fixture: ComponentFixture<AttendeesDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendeesDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendeesDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
