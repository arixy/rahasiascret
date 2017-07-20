import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { XHRBackend, RequestOptions } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { AuthenticationService } from './services/authentication.service';
import { AuthGuard } from './services/auth-guard.service'; 
import { LocationService } from './services/location.service';
import { PeriodService } from './services/period.service';
import { WorkOrderService } from './services/work-order.service';
import { MaintenanceService } from './pages/preventatives/maintenance.service';
import { PriorityService } from './pages/priorities/priority.service';
import { EntityService } from './pages/entities/entity.service';
import { AssetService } from './services/asset.service';
import { KPIBaselineDurationService } from './services/kpi-baseline-duration.service';
import { routing } from './app.routing';
import { UtilityTypesService } from './pages/utilities-type/utility-types.service';
import { UtilityUomService } from './pages/utilities-uom/utility-uom.service';
import { ExpenseTypeService } from './pages/expense-type/expense-type.service';
import { WeekendService } from './pages/weekends/weekend.service';
import { EntityTypeService } from './services/entity-type.service';
import { UOMService } from './services/uom.service';
import { UtilityTypeService } from './services/utility-type.service';
import { StatusService } from './services/status.service';
import { WorkOrderTypeService } from './services/wo-type.service';


import { UsersService } from './pages/users/users.service';

import { RoleService } from './pages/role/role.service';
import { UsersRolesService } from './pages/users-role/users-roles.service';
import { HolidayService } from './pages/holidays/holiday.service';
import { UtilityConsumptionsService } from './pages/utility-consumptions/utility-consumptions.service';
import { PaperHttp } from './services/paper-http.service';
import { AccessRightsService } from './pages/access-rights/access-rights.service';


// task services
import { TaskService } from './pages/task/task.service';
import { ConsumptionReportService } from './pages/reports/consumption/consumption-report.service';
import { WorkOrderReportService } from './pages/reports/workorder/wo-report.service';
import { PerformanceReportService } from './pages/reports/performance/performance-report.service';

// App is our top level component
import { App } from './app.component';
import { AppState, InternalStateType } from './app.service';
import { GlobalState } from './global.state';
import { NgaModule } from './theme/nga.module';
import { PagesModule } from './pages/pages.module';

// Application wide providers
const APP_PROVIDERS = [
  AppState,
  GlobalState
];

export type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

export function httpFactory(backend: XHRBackend, options: RequestOptions) {
    return new PaperHttp(backend, options);
}
/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [App],
  declarations: [
    App
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    HttpModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule.forRoot(),
    PagesModule,
    routing
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS,
    AuthGuard,
    AuthenticationService,
    WorkOrderService,
    LocationService,
    AssetService,
    MaintenanceService,
    PriorityService,
    EntityService,
    UtilityTypesService,
    UtilityUomService,
    ExpenseTypeService,
	UsersService,
	RoleService,
    WeekendService,
    UsersRolesService,
    HolidayService,
    UtilityConsumptionsService,
    EntityTypeService,
    KPIBaselineDurationService,
    {
        provide: PaperHttp,
        useFactory: httpFactory,
        deps: [XHRBackend, RequestOptions]
    },
    TaskService,
    LocationService,
    PeriodService,
      UOMService,
      UtilityTypeService,
      AccessRightsService,
      StatusService,
      WorkOrderTypeService,
      ConsumptionReportService,
      WorkOrderReportService,
      PerformanceReportService
  ]
})

export class AppModule {

  constructor(public appRef: ApplicationRef, public appState: AppState) {
  }

  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }
    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
