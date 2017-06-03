import { Component, Input, Output, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions } from 'ng2-datepicker';
import { SelectComponent, SelectItem } from 'ng2-select';

//import { TaskService } from '../task.service';
//import { LocationService } from '../../../services/location.service';
//import { AssetService } from '../../../services/asset.service';
//import { UsersService } from '../../users/users.service';
//import { RoleService } from '../../role/role.service';

import { WorkflowActions, WorkOrderStatuses } from '../../../../global.state';

@Component({
    selector: 'wo-expenses',
    templateUrl: './workorder-expenses.component.html',
    //providers: [LocationService, AssetService, UsersService, RoleService]
})
export class WorkOrderExpensesComponent {
    @Input('actionType') actionType;
    @Input('selectedWO') selectedWO;
    @Input('selectedWoType') selectedWoType: { id, label };
    @Input('formGroup') formGroup;
    @Output('expenses') @Input('expenses') expenses;

    @Input('isCanEdit')
    private isCanEdit = true;

    private items_expenses_type = [{id: 1, text: 'Sample'}];

    ngOnInit() {
        this.setFieldPermission();
    }

    private setFieldPermission() {

    }

    public addExpenses() {
        if (this.expenses == null) this.expenses = [];
        this.expenses.push({expenseTypeName: "", amount: "", description: "", refNumber: "", refDate: null});
    }
}