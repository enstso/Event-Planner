import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      // ✅ LoginComponent is standalone, so we put it in `imports`
      imports: [
        LoginComponent,
        RouterTestingModule,  // ✅ provides Router + ActivatedRoute for RouterLink
        ReactiveFormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form initially', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should not call AuthService.login when form is invalid', () => {
    // form starts invalid (empty)
    component.onSubmit();

    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should mark all controls as touched when submitting invalid form', () => {
    const emailControl = component.loginForm.get('email');
    const passwordControl = component.loginForm.get('password');

    expect(emailControl?.touched).toBeFalse();
    expect(passwordControl?.touched).toBeFalse();

    component.onSubmit();

    expect(emailControl?.touched).toBeTrue();
    expect(passwordControl?.touched).toBeTrue();
  });

  it('should call AuthService.login with form values when form is valid', () => {
    const loginDto = { email: 'test@example.com', password: 'secret123' };
    component.loginForm.setValue(loginDto);

    authServiceMock.login.and.returnValue(of(null));

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
  });

  it('should navigate to /events on successful login', () => {
    const loginDto = { email: 'test@example.com', password: 'secret123' };
    component.loginForm.setValue(loginDto);

    const user = { id: 1, email: loginDto.email, role: 'USER' } as any;
    authServiceMock.login.and.returnValue(of(user));

    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
    expect(component.errorMessage).toBeNull();
  });

  it('should set errorMessage when credentials are invalid', () => {
    const loginDto = { email: 'test@example.com', password: 'wrong' };
    component.loginForm.setValue(loginDto);

    // AuthService.login returns null → invalid credentials
    authServiceMock.login.and.returnValue(of(null));

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials.');
  });

  it('should set errorMessage on login error', () => {
    const loginDto = { email: 'test@example.com', password: 'secret123' };
    component.loginForm.setValue(loginDto);

    authServiceMock.login.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe('An error occurred during login.');
    expect(component.isSubmitting).toBeFalse();
  });
});
