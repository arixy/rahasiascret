import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule as AngularFormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { routing }       from './forms.routing';

import { RatingModule } from 'ng2-bootstrap';
import { Forms } from './forms.component';
import { Locations } from './components/locations/locations.component';
import { WorkOrders } from './components/work-orders/work-orders.component';

import { SelectModule } from 'ng2-select';
import { TreeModule } from 'angular2-tree-component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ModalModule } from 'ng2-bootstrap';

import { InlineForm } from './components/locations/components/inlineForm';
import { BlockForm } from './components/locations/components/blockForm';
import { HorizontalForm } from './components/locations/components/horizontalForm';
import { BasicForm } from './components/locations/components/basicForm';
import { WithoutLabelsForm } from './components/locations/components/withoutLabelsForm';
import { DataTableModule,SharedModule } from 'primeng/primeng';
import { DropdownModule } from 'ng2-bootstrap';
import { TreeTableModule,TreeNode } from 'primeng/primeng';
import { ResetFilterModule } from './../reset-filter.module';
import { SpinnerModule } from './../spinner.module';

@NgModule({
  imports: [
    CommonModule,
    AngularFormsModule,
    ReactiveFormsModule,
    NgaModule,
    RatingModule.forRoot(),
    routing,
    SelectModule,
    TreeModule,
    Ng2SmartTableModule,
    ModalModule.forRoot(),
    DataTableModule,
    SharedModule,
    DropdownModule.forRoot(),
    TreeTableModule,
    ResetFilterModule,
    SpinnerModule
  ],
  declarations: [
    Locations,
    WorkOrders,
    Forms,
    InlineForm,
    BlockForm,
    HorizontalForm,
    BasicForm,
    WithoutLabelsForm
  ]
})
export class FormsModule {
}
