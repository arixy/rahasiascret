import { Injectable }     from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot }    from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthenticationService, private router: Router) {}
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      console.log('AuthGuard#canActivate called');
        let url: string = state.url;
        return this.checkLogin(url);
    }
    
    checkLogin(url: string): boolean {
        if(this.authService.check()) {
            console.log("True");
            return true;
        }
        
        this.authService.redirectUrl = url;
        this.router.navigate(['/login']);
        return false;
    }
}