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

        if (routeMenuId != null && route.data['type'] == null) {
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
                } else if (route.params[route.data['extraParam']] === 'owner') {
                    hasAccess = authorizedSitemaps['OwnerWorkOrder'] != null
                        && (authorizedSitemaps['OwnerWorkOrder'].allowAccessOrView
                        || authorizedSitemaps['OwnerWorkOrder'].allowAdd
                        || authorizedSitemaps['OwnerWorkOrder'].allowUpdate
                        || authorizedSitemaps['OwnerWorkOrder'].allowDelete);
                } else if (route.params[route.data['extraParam']] === 'recurring') {
                    hasAccess = authorizedSitemaps['RecurringWorkOrder'] != null
                        && (authorizedSitemaps['RecurringWorkOrder'].allowAccessOrView
                        || authorizedSitemaps['RecurringWorkOrder'].allowAdd
                        || authorizedSitemaps['RecurringWorkOrder'].allowUpdate
                        || authorizedSitemaps['RecurringWorkOrder'].allowDelete);
                } else if (route.params[route.data['extraParam']] === 'preventive') {
                    hasAccess = authorizedSitemaps['PreventiveWorkOrder'] != null
                        && (authorizedSitemaps['PreventiveWorkOrder'].allowAccessOrView
                        || authorizedSitemaps['PreventiveWorkOrder'].allowAdd
                        || authorizedSitemaps['PreventiveWorkOrder'].allowUpdate
                        || authorizedSitemaps['PreventiveWorkOrder'].allowDelete);
                } else if (route.params[route.data['extraParam']] === 'tenant') {
                    hasAccess = authorizedSitemaps['TenantWorkOrder'] != null
                        && (authorizedSitemaps['TenantWorkOrder'].allowAccessOrView
                        || authorizedSitemaps['TenantWorkOrder'].allowAdd
                        || authorizedSitemaps['TenantWorkOrder'].allowUpdate
                        || authorizedSitemaps['TenantWorkOrder'].allowDelete);
                } else if (route.params[route.data['extraParam']] === 'guest') {
                    hasAccess = authorizedSitemaps['GuestWorkOrder'] != null
                        && (authorizedSitemaps['GuestWorkOrder'].allowAccessOrView
                        || authorizedSitemaps['GuestWorkOrder'].allowAdd
                        || authorizedSitemaps['GuestWorkOrder'].allowUpdate
                        || authorizedSitemaps['GuestWorkOrder'].allowDelete);
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
            } else if (route.data['type'] === 'EntityList') {
                if (route.params[route.data['extraParam']] == '1') {
                    hasAccess = authorizedSitemaps['Vendor'] != null
                        && (authorizedSitemaps['Vendor'].allowAccessOrView
                        || authorizedSitemaps['Vendor'].allowAdd
                        || authorizedSitemaps['Vendor'].allowUpdate
                        || authorizedSitemaps['Vendor'].allowDelete);
                } else if (route.params[route.data['extraParam']] == '2') {
                    hasAccess = authorizedSitemaps['Tenant'] != null
                        && (authorizedSitemaps['Tenant'].allowAccessOrView
                        || authorizedSitemaps['Tenant'].allowAdd
                        || authorizedSitemaps['Tenant'].allowUpdate
                        || authorizedSitemaps['Tenant'].allowDelete);
                } else if (route.params[route.data['extraParam']] == '3') {
                    hasAccess = authorizedSitemaps['Guest'] != null
                        && (authorizedSitemaps['Guest'].allowAccessOrView
                        || authorizedSitemaps['Guest'].allowAdd
                        || authorizedSitemaps['Guest'].allowUpdate
                        || authorizedSitemaps['Guest'].allowDelete);
                } else if (route.params[route.data['extraParam']] == '4') {
                    hasAccess = authorizedSitemaps['Owner'] != null
                        && (authorizedSitemaps['Owner'].allowAccessOrView
                        || authorizedSitemaps['Owner'].allowAdd
                        || authorizedSitemaps['Owner'].allowUpdate
                        || authorizedSitemaps['Owner'].allowDelete);
                }
            }
        }

        if (hasAccess) {
            return true;
        }

        // redirect if user has no permission
        this.router.navigate(['pages','access-denied']);
        return false;
    }
}