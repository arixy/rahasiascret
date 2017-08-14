import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RoutingGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean>{
        console.log("RoutingGuard#canActivate - searching for active permission", route, state);
        let authorizedSitemaps: any = JSON.parse(localStorage.getItem('authorizedSitemaps'));
        let routeMenuId: any[] = route.data['menuId']; // return array

        let hasAccess = false;

        if (routeMenuId != null) {
            routeMenuId.forEach(item => {
                if (authorizedSitemaps[item] != null) {
                    if (authorizedSitemaps[item].allowAccessOrView
                        || authorizedSitemaps[item].allowAdd
                        || authorizedSitemaps[item].allowUpdate
                        || authorizedSitemaps[item].allowDelete) {
                        // if has at least 1 allowed flag
                        hasAccess = true;
                    }
                }
            });
        } else {
            if (route.data['type'] === 'WorkOrderList') {
                if (route.params[route.data['extraParam']] === 'single') {
                    hasAccess = authorizedSitemaps['SingleWorkOrder'] != null
                        && (authorizedSitemaps['SingleWorkOrder'].allowAccessOrView
                            || authorizedSitemaps['SingleWorkOrder'].allowAdd
                            || authorizedSitemaps['SingleWorkOrder'].allowUpdate
                            || authorizedSitemaps['SingleWorkOrder'].allowDelete);
                }
            } else if (route.data['type'] === 'Setups') {
                let accessurl = state.url.substring(state.url.lastIndexOf('/') + 1);
                console.log("access url", accessurl);
                if (accessurl == 'locations') {
                    hasAccess = authorizedSitemaps['Location'] != null
                        && (authorizedSitemaps['Location'].allowAccessOrView
                            || authorizedSitemaps['Location'].allowAdd
                            || authorizedSitemaps['Location'].allowUpdate
                            || authorizedSitemaps['Location'].allowDelete);
                } else if (accessurl == 'work-orders') {
                    hasAccess = authorizedSitemaps['WOCategory'] != null
                        && (authorizedSitemaps['WOCategory'].allowAccessOrView
                        || authorizedSitemaps['WOCategory'].allowAdd
                        || authorizedSitemaps['WOCategory'].allowUpdate
                        || authorizedSitemaps['WOCategory'].allowDelete);
                }
            }
        }

        if (hasAccess) {
            return true;
        }

        // redirect if user has no permission
        this.router.navigate(['pages','dashboard']);
        return false;
    }
}