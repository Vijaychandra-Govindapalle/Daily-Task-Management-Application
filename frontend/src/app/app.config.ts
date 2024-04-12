import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { WebReqInterceptor } from './web-req.interceptor';



export const appConfig: ApplicationConfig = {
  providers:[{provide :HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true},HttpClientModule,provideRouter(routes), provideClientHydration(),provideHttpClient(withFetch(),withInterceptorsFromDi()), provideAnimationsAsync('noop'),MatNativeDateModule,{provide: MAT_DATE_LOCALE, useValue: 'en-GB'},RouterModule, provideAnimationsAsync(),]
};
