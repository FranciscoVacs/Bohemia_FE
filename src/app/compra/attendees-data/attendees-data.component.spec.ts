import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../services/auth.service.js';
import { AttendeesDataComponent } from './attendees-data.component';

describe('AttendeesDataComponent', () => {
  let component: AttendeesDataComponent;
  let fixture: ComponentFixture<AttendeesDataComponent>;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should autocomplete form with user data', () => {
    // Arrange
    const mockUser = {
      id: -1,
      userName: 'Name',
      userSurname: 'Surname',
      email: 'nameSurname@gmail.com',
      birthDate: '01012000',
      isAdmin: false
    };

    authServiceMock.currentUser.and.returnValue(mockUser);
    spyOn(component.attendeeForm, 'patchValue');

    // Act
    component.autoCompleteAttendeeData();

    // Assert
    expect(component.attendeeForm.patchValue).toHaveBeenCalledWith({
      name: 'Name',
      surname: 'Surname',
      email: 'nameSurname@gmail.com'
    });
  });

  it('should not patch form if there is no current user', () => {
    // Arrange
    authServiceMock.currentUser.and.returnValue(null);
    spyOn(component.attendeeForm, 'patchValue');

    // Act
    component.autoCompleteAttendeeData();

    // Assert
    expect(component.attendeeForm.patchValue).not.toHaveBeenCalled();
  });
});