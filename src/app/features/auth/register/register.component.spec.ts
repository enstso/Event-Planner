import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RegisterDto } from '../../../core/dto/auth.dto';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,      // standalone component
        RouterTestingModule     // ✅ provides Router + ActivatedRoute + routerLink directives
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.register on valid submit and navigate to /auth/login', () => {
    // Arrange: valid form values
    const dto: RegisterDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
      confirmPassword: 'password'
    };

    component.registerForm.setValue(dto);

    authService.register.and.returnValue(of({} as any));
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    // Act
    component.onSubmit();

    // Assert
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(component.isSubmitting).toBeFalse();
    expect(component.errorMessage).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should set errorMessage on registration error', () => {
    // Arrange: valid form
    const dto: RegisterDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password',
      confirmPassword: 'password'
    };

    component.registerForm.setValue(dto);

    authService.register.and.returnValue(throwError(() => new Error('API error')));

    // Act
    component.onSubmit();

    // Assert
    expect(component.isSubmitting).toBeFalse();
    expect(component.errorMessage).toBe('An error occurred during registration.');
  });

  it('should mark all controls as touched and not call register when form is invalid', () => {
    // Form is invalid by default (empty)
    const markAllAsTouchedSpy = spyOn(component.registerForm, 'markAllAsTouched');

    component.onSubmit();

    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(authService.register).not.toHaveBeenCalled();
  });
});
