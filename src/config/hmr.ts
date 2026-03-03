import { ApplicationRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';

export const hmrBootstrap = (
  hotModule: any,
  bootstrap: () => Promise<ApplicationRef>,
) => {
  let applicationRef: ApplicationRef;
  
  if (hotModule) {
    hotModule.accept();
    bootstrap().then((ref) => {
      applicationRef = ref;
      return applicationRef;
    });
    
    hotModule.dispose(() => {
      if (applicationRef) {
        const elements = applicationRef.components.map(
          (c) => c.location.nativeElement,
        );
        const removeOldHosts = createNewHosts(elements);
        applicationRef.components.forEach((component) => {
          component.destroy();
        });
        removeOldHosts();
      }
    });
  } else {
    bootstrap();
  }
};
