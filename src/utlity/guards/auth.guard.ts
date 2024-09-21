import { CanActivateFn, Router } from '@angular/router';
import { CommonServiceService } from '../services/common-service.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(CommonServiceService);
  const router = inject(Router);
  if (authService.isUserLogIn) {
    return true;
  } else {
    router.navigate(['/login']);
    return true;
  }
};
