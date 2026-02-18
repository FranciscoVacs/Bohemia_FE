/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service';
import { AttendeesDataComponent } from './attendees-data.component';

describe('AttendeesDataComponent', () => {
  let component: AttendeesDataComponent;
  let fixture: ComponentFixture<AttendeesDataComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      isAuthenticated: jasmine.createSpy(),
      currentUser: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [AttendeesDataComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AttendeesDataComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should autocomplete form on init when user is authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);
    authServiceMock.currentUser.and.returnValue({
        userName: 'Name',
        userSurname: 'Surname',
        email: 'nameSurname@gmail.com',
    });

    spyOn(component.attendeeForm, 'patchValue');

    fixture.detectChanges(); // runs ngOnInit

    expect(component.attendeeForm.patchValue).toHaveBeenCalledWith({
      name: 'Name',
      surname: 'Surname',
      email: 'nameSurname@gmail.com'
    });
  });

  it('should NOT autocomplete form when user is not authenticated', () => {
    authServiceMock.isAuthenticated.and.returnValue(false);
    authServiceMock.currentUser.and.returnValue(null);

    spyOn(component.attendeeForm, 'patchValue');

    fixture.detectChanges();

    expect(component.attendeeForm.patchValue).not.toHaveBeenCalled();
  });

  it('should not crash if authenticated but currentUser is null', () => {
    authServiceMock.isAuthenticated.and.returnValue(true);
    authServiceMock.currentUser.and.returnValue(null);

    spyOn(component.attendeeForm, 'patchValue');

    fixture.detectChanges();

    expect(component.attendeeForm.patchValue).not.toHaveBeenCalled();
  });

});