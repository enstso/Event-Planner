import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

// Defines the list of routes specific to the Auth module.
// These routes are lazy-loaded under the "/auth" path in the main routing file.
const routes: Routes = [
  // Route for the login page → /auth/login
  { path: 'login', component: LoginComponent },

  // Route for the register page → /auth/register
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  // Registers the child routes so they are accessible when the Auth module is loaded.
  imports: [RouterModule.forChild(routes)],

  // Exports RouterModule so components in this module can use routerLink, router-outlet, etc.
  exports: [RouterModule]
})
export class AuthRoutingModule {}
