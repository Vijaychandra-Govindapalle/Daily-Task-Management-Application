import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { WebReqInterceptor } from './web-req.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

const serverConfig: ApplicationConfig = {
  providers: [
  provideServerRendering(),
  {provide :HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true},
  HttpClientModule
  
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
