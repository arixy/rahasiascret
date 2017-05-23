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
           DropdownModule.forRoot()
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
	  ScheduleComponent
    ]
})
export class PagesModule {
}
