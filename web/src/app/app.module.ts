import { BrowserModule } from '@angular/platform-browser';
import {Injector, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';

import { AppRoutingModule } from './app-routing/app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import {FormsModule} from '@angular/forms';
import { ConfirmCodeComponent } from './confirm-code/confirm-code.component';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {FillInfoComponent} from './fill-info/fill-info.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AuthGuardService} from './services/auth-guard.service';
import { DenyComponent } from './deny/deny.component';
import {RequestAuthInterceptor} from './interceptors/RequestAuthInterceptor';
import {ChangePasswordGuard} from './change-password/change-password-guard';
import {SecurePipe} from './pipes/SecurePipe';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    LoginComponent,
    ConfirmCodeComponent,
    ChangePasswordComponent,
    FillInfoComponent,
    DenyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    AuthGuardService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestAuthInterceptor, multi: true },
    ChangePasswordGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
