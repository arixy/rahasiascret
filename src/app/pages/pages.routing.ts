import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';
import { ModuleWithProviders } from '@angular/core';
import { AuthGuard } from '../services/auth-guard.service';
import { Preventatives } from './preventatives/preventatives.component';
import { Reports } from './reports/reports.component';
import { WOReports } from './reports/woreports.component';
import { Assets } from './assets/assets.component';
import { AllList } from './all-list.component';
import { Priorities } from './priorities/priorities.component';
import { Entities } from './entities/entities.component';
import { UtilityTypes } from './utilities-type/utility-types.component';
import { UtilityUom } from './utilities-uom/utility-uom.component';
import { ExpenseType } from './expense-type/expense-types.component';
import { UsersComponent } from './users/users.component';
import { RoleComponent } from './role/role.component';
import { Weekends } from './weekends/weekends.component';
import { UtilityConsumptions } from './utility-consumptions/utility-consumptions.component';
import { TaskComponent } from './task/task.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { AccessRightsComponent } from './access-rights/access-rights.component';
import { WorkOrderListReportComponent } from './reports/workorder/wo-report.component';
import { ConsumptionReportComponent } from './reports/consumption/consumption-report.component';
import { PerformanceReportComponent } from './reports/performance/performance-report.component';
import { SettingsComponent } from './settings/settings.component';
// noinspection TypeScriptValidateTypes

// export function loadChildren(path) { return System.import(path); };

import { RoutingGuard } from './routing-guard';
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: 'app/pages/login/login.module#LoginModule'
  },
  {
    path: 'register',
    loadChildren: 'app/pages/register/register.module#RegisterModule'
  },
  {
    path: 'pages',
    component: Pages,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: 'app/pages/dashboard/dashboard.module#DashboardModule' },
      { path: 'editors', loadChildren: 'app/pages/editors/editors.module#EditorsModule' }, // ?
      { path: 'components', loadChildren: 'app/pages/components/components.module#ComponentsModule' }, // ?
      { path: 'charts', loadChildren: 'app/pages/charts/charts.module#ChartsModule' }, // ?
      { path: 'ui', loadChildren: 'app/pages/ui/ui.module#UiModule' }, // ?
      { path: 'forms', loadChildren: 'app/pages/forms/forms.module#FormsModule' }, // ?
      { path: 'tables', loadChildren: 'app/pages/tables/tables.module#TablesModule'}, // ?
      { path: 'setups', loadChildren: 'app/pages/setups/forms.module#FormsModule', canActivate: [RoutingGuard], data: { type: 'Setups' } }, // how to?
      { path: 'transactions/workorders/:request_type', component: Preventatives, pathMatch: 'prefix', canActivate: [RoutingGuard], data: { type: 'WorkOrderList', extraParam: ['request_type'] } },
      //{ path: 'preventatives', component: Preventatives, /*data: { menuId: 'WorkOrderList' }*/ }, // ?
      { path: 'assets', component: Assets, canActivate: [RoutingGuard], data: { menuId: ['Asset'] }},
      { path: 'reports', component: Reports, canActivate: [RoutingGuard], data: { menuId: ['ReportWorkOrder', 'ReportConsumption', 'ReportPerformance'] } },
      // { path: 'woreports', component: WOReports }, // ?
      { path: 'all-list', component: AllList, canActivate: [RoutingGuard], data: { menuId: ['Vendor', 'Tenant', 'Guest', 'Owner', 'WOPriority', 'ExpenseType', 'UtilityType', 'UtilityUOM'] } },
      { path: 'priorities', component: Priorities, canActivate: [RoutingGuard], data: { menuId: ['WOPriority'] } },
      { path: 'entities/:entity_type_id', component: Entities, canActivate: [RoutingGuard], data: { menuId: ['Vendor', 'Tenant', 'Guest', 'Owner'] } },
      //{ path: 'entities', component: Entities }, // ?
      { path: 'utility-types', component: UtilityTypes, canActivate: [RoutingGuard], data: { menuId: ['UtilityType'] } },
      { path: 'utility-uom', component: UtilityUom, canActivate: [RoutingGuard], data: { menuId: ['UtilityUOM'] } },
      { path: 'expense-type', component: ExpenseType, canActivate: [RoutingGuard], data: { menuId: ['ExpenseType'] } },
      { path: 'users', component: UsersComponent, canActivate: [RoutingGuard], data: { menuId: ['User'] } },
      { path: 'role', component: RoleComponent, canActivate: [RoutingGuard], data: { menuId: ['Role'] } },
      //{ path: 'weekends', component: Weekends }, // ?
      { path: 'utility-consumptions', component: UtilityConsumptions }, // ?
      { path: 'tasks', component: TaskComponent, canActivate: [RoutingGuard], data: { menuId: ['MyTask'] } },
      { path: 'schedules', component: ScheduleComponent }, // ?
      { path: 'transactions/workorders', component: Preventatives, canActivate: [RoutingGuard], data: { menuId: ['WorkOrderList'] } },
      { path: 'transactions/consumptions', component: UtilityConsumptions, canActivate: [RoutingGuard], data: { menuId: ['UtilityConsumption'] } },
      { path: 'access-rights', component: AccessRightsComponent, canActivate: [RoutingGuard], data: { menuId: ['AccessRights'] } },
      { path: 'wo-report', component: WorkOrderListReportComponent, canActivate: [RoutingGuard], data: { menuId: ['ReportWorkOrder'] } },
      { path: 'consumption-report', component: ConsumptionReportComponent, canActivate: [RoutingGuard], data: { menuId: ['ReportConsumption'] } },
      { path: 'performance-report', component: PerformanceReportComponent, canActivate: [RoutingGuard], data: { menuId: ['ReportPerformance'] } },
      { path: 'settings', component: SettingsComponent, canActivate: [RoutingGuard], data: { menuId: ['SystemSetting']} },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
