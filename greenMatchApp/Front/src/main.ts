import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';

const providers = [
  ...(appConfig?.providers ?? []),
  provideHttpClient(withFetch()), // ensures HttpClient is available and uses fetch (recommended for SSR)
];

bootstrapApplication(AppComponent, { ...appConfig, providers })
  .catch((err) => console.error(err));


