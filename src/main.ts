import { bootstrapApplication } from '@angular/platform-browser';
import { provideRdxDialog } from '@radix-ng/primitives/dialog';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const updatedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideRdxDialog()
  ]
};

bootstrapApplication(AppComponent, updatedConfig)
  .catch((err) => console.error(err));
