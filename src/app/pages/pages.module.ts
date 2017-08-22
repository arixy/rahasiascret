import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './pages.routing';
import { NgaModule } from '../theme/nga.module';

import { SelectModule } from 'ng2-select';

import { Assets } from './assets/assets.component';
import { Pages } from './pages.component';
import { Preventatives } from './preventatives/preventatives.component';
import { Reports } from './reports/reports.component';
import { WOReports } from './reports/woreports.component';
import { AllList } from './all-list.component';
import { Priorities } from './priorities/priorities.component';
import { Entities } from './entities/entities.component';
import { UtilityTypes } from './utilities-type/utility-types.component';
import { UtilityUom } from './utilities-uom/utility-uom.component';
import { ExpenseType } from './expense-type/expense-types.component';
import { Weekends } from './weekends/weekends.component';

import { UsersComponent } from './users/users.component';

import { RoleComponent } from './role/role.component';

import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ModalModule } from 'ng2-bootstrap';
import { ButtonsModule } from 'ng2-bootstrap';
import { DropdownModule } from 'ng2-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'ng2-datepicker';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { MdSlideToggleModule } from '@angular/material';
import { ExpensesComponent } from './preventatives/components/expenses/expenses.component';
import { DataTableModule,SharedModule } from 'primeng/primeng';
import { TreeModule } from 'angular2-tree-component';
import { UtilityConsumptions } from './utility-consumptions/utility-consumptions.component';
import { TaskComponent } from './task/task.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { AccessRightsComponent } from './access-rights/access-rights.component';


import { SingleRequestComponent } from './task/forms/singlerequest.component';
import { TenantRequestComponent } from './task/forms/tenantrequest.component';
import { OwnerRequestComponent } from './task/forms/ownerrequest.component';
import { GuestRequestComponent } from './task/forms/guestrequest.component';
import { RecurringRequestComponent } from './task/forms/recurringrequest.component';
import { PreventiveRequestComponent } from './task/forms/preventiverequest.component';
//import { AddNewWorkOrderComponent } from './task/add-wo.component';
//import { TabContentRecurringComponent } from './task/tabs/recurring.component';
import { WorkOrderExpensesComponent } from './task/forms/subforms/workorder-expenses.component';
import { WorkOrderFilesComponent } from './task/forms/subforms/workorder-files.component';
import { PrintWOComponent } from './task/print/print-wo.component';
import { SettingsComponent } from './settings/settings.component';
import { UtilityFormComponent } from './utility-consumptions/forms/utility-form.component';

import { AssetFilesComponent } from './assets/subforms/asset-files.component';

import { WorkOrderListReportComponent } from './reports/workorder/wo-report.component';
import { PerformanceReportComponent } from './reports/performance/performance-report.component';
import { ConsumptionReportComponent } from './reports/consumption/consumption-report.component';

// add primeng
import { TabViewModule, FileUploadModule, PanelModule, CalendarModule, CheckboxModule, PaginatorModule } from 'primeng/primeng';
import { TreeTableModule, TreeNode, ChartModule } from 'primeng/primeng';

import {MdTabsModule} from '@angular/material';
import { LoadingSmallComponent } from './loading-small.component';
import { SpinnerModule } from './spinner.module';
import { ResetFilterModule } from './reset-filter.module';
import { DialogsService } from './../services/dialog.service';
import { ConfirmDeleteDialog } from './../confirm-delete.dialog';

import { FilterInputComponent } from './filter-input.component';
import { AccessDenied } from './access-denied/access-denied.component';

@NgModule({
  imports: [CommonModule, NgaModule, routing, SelectModule, Ng2SmartTableModule, ModalModule.forRoot(), ReactiveFormsModule,
           DatePickerModule,
           FormsModule,
           ButtonsModule,
           MaterialModule,
           MdSlideToggleModule,
           DataTableModule,
           SharedModule,
           TreeModule,
           DropdownModule.forRoot(),
           TabViewModule,
		   FileUploadModule,
		   PanelModule,
		   MdTabsModule,
      CalendarModule,
      TreeTableModule,
      CheckboxModule,
      PaginatorModule,
      ChartModule,
      ResetFilterModule,
      SpinnerModule
           ],
    providers: [
        DialogsService
    ],
  declarations: [
      Pages, 
      Preventatives, ExpensesComponent, Reports, WOReports, 
      Assets,
      AllList,
      Priorities,
      Entities,
      UtilityTypes,
      UtilityUom,
      ExpenseType,
	  UsersComponent,
	  RoleComponent,
      Weekends,
      UtilityConsumptions,
	  TaskComponent,
	  ScheduleComponent,
      AccessRightsComponent,
      SingleRequestComponent,
      TenantRequestComponent,
      OwnerRequestComponent,
      GuestRequestComponent,
      RecurringRequestComponent,
      PreventiveRequestComponent,
      WorkOrderExpensesComponent,
      WorkOrderFilesComponent,
      AssetFilesComponent,
      PrintWOComponent,
      //SpinnerComponent,
      //ResetFilterComponent,
      LoadingSmallComponent,
      UtilityFormComponent,
      // reports
      WorkOrderListReportComponent,
      ConsumptionReportComponent,
      PerformanceReportComponent,
      ConfirmDeleteDialog,
      SettingsComponent,
      // filter component
      FilterInputComponent,
      AccessDenied
    ],
    entryComponents: [
        ConfirmDeleteDialog
    ]
})
export class PagesModule {
}
