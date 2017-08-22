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
import { AccessDenied } from './access-denied/access-denied.component';
// noinspection TypeScriptValidateTypes

// export function loadChildren(path) { return System.import(path); };

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
      { path: 'editors', loadChildren: 'app/pages/editors/editors.module#EditorsModule' },
      { path: 'components', loadChildren: 'app/pages/components/components.module#ComponentsModule' },
      { path: 'charts', loadChildren: 'app/pages/charts/charts.module#ChartsModule' },
      { path: 'ui', loadChildren: 'app/pages/ui/ui.module#UiModule' },
      { path: 'forms', loadChildren: 'app/pages/forms/forms.module#FormsModule' },
      { path: 'tables', loadChildren: 'app/pages/tables/tables.module#TablesModule' },
      { path: 'setups', loadChildren: 'app/pages/setups/forms.module#FormsModule' },
      { path: 'transactions/workorders/:request_type', component: Preventatives, pathMatch: 'prefix' },
      { path: 'preventatives', component: Preventatives },
      { path: 'assets', component: Assets},
      { path: 'reports', component: Reports },
      { path: 'woreports', component: WOReports },
      { path: 'all-list', component: AllList },
      { path: 'priorities', component: Priorities },
      { path: 'entities/:entity_type_id', component: Entities },
      { path: 'entities', component: Entities },
      { path: 'utility-types', component: UtilityTypes },
      { path: 'utility-uom', component: UtilityUom },
      { path: 'expense-type', component: ExpenseType },
      { path: 'users', component: UsersComponent },
      { path: 'role', component: RoleComponent },
      { path: 'weekends', component: Weekends },
      { path: 'utility-consumptions', component: UtilityConsumptions },
      { path: 'tasks', component: TaskComponent },
      { path: 'schedules', component: ScheduleComponent },
      { path: 'transactions/workorders', 
        component: Preventatives
      },
      { path: 'transactions/consumptions', component: UtilityConsumptions },
      { path: 'access-rights', component: AccessRightsComponent },
      { path: 'wo-report', component: WorkOrderListReportComponent },
      { path: 'consumption-report', component: ConsumptionReportComponent },
      { path: 'performance-report', component: PerformanceReportComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'access-denied', component: AccessDenied }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
