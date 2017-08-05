import { Component, Input, Output, ChangeDetectorRef, ViewChild, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, FormControl } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions } from 'ng2-datepicker';
import { SelectComponent, SelectItem } from 'ng2-select';
import { ExpenseTypeService } from '../../../expense-type/expense-type.service';


//import { TaskService } from '../task.service';
//import { LocationService } from '../../../services/location.service';
//import { AssetService } from '../../../services/asset.service';
//import { UsersService } from '../../users/users.service';
//import { RoleService } from '../../role/role.service';

import { WorkflowActions, WorkOrderStatuses, GlobalConfigs } from '../../../../global.state';

import { CustomValidators } from '../custom-validators';

@Component({
    selector: 'wo-expenses',
    templateUrl: './workorder-expenses.component.html',
})
export class WorkOrderExpensesComponent {
    @Input('actionType') actionType;
    @Input('selectedWO') selectedWO;
    @Input('selectedWoType') selectedWoType: { id, label };
    @Input('formGroup') formGroup;
    @Output('expenses') @Input('expenses') expenses;
    public deleted_expenses = [];
    public _expensesFilters = [];

    @Input('isCanEdit')
    private isCanEdit = true;

    @Output('changes')
    private changes = new EventEmitter<string>();

    private items_expenses_types = [{ id: 1, text: 'Sample' }];

    private _yearRange = GlobalConfigs.yearRange;

    constructor(private _expenseTypeService: ExpenseTypeService) {
        this.deleted_expenses = new Array();
    }

    ngOnInit() {
        this._expenseTypeService.getExpenses().subscribe((response) => {
            console.log("expenses response", response.data);

            var tmpLstExpenses = response.data;
            this.items_expenses_types = [];

            for (var i = 0; i < tmpLstExpenses.length; i++) {
                this.items_expenses_types.push({ id: tmpLstExpenses[i].expenseTypeId, text: tmpLstExpenses[i].name });
            }
        });
        
    }

    public addExpenses() {
        if (this.expenses == null) this.expenses = [];
        this.expenses.push({
            workOrderExpenseId: null,
            expenseTypeId: null,
            amount: "",
            description: "",
            referenceNumber: "",
            referenceDate: null,
            isActive: true,
            touched: false,
            active: []
        });
    }

    public removeExpense(expenseToRemove) {
        expenseToRemove.isActive = false;
        // code below is deprecated and might be deleted in the near future
        if (expenseToRemove.workOrderExpenseId != null) {
            this.deleted_expenses.push(expenseToRemove);
            //this._expensesFilters.push(expenseToRemove);
        }

        this.changes.emit("removeExpenses");
    }

    private filterExpense(expense) {
        return expense.isActive;
    } 

    setSelectedExpenseType(expense, event) {
        expense.expenseTypeId = event.id;
    }

    removeSelectedExpenseType(expense, event) {
        expense.expenseTypeId = null;
    }

    getExpenses() {
        if (this.expenses == null) this.expenses = [];

        return this.expenses.filter(this.filterExpense);
    }

    markAsTouched(marker, field: string) {
        console.log("markAsTouched", marker, field);
        switch (field) {
            case 'expenseTypeTouched': marker.expenseTypeTouched = true; break;
            case 'amountTouched': marker.amountTouched = true; break;
            case 'descTouched': marker.descTouched = true; break;
            case 'refNumberTouched': marker.refNumberTouched = true; break;
            case 'refDateTouched': marker.refDateTouched = true; break;
        }

        this.changes.emit("elementTouched");
    }

    //isAmountValid(expense) {
    //    let amountControl = new FormControl();
    //    amountControl.setValue(expense.amount);

    //    let validationResult = CustomValidators.numberOnly(amountControl);

    //    if (validationResult != null) {
    //        return false;
    //    }

    //    return true;
    //}

    hasErrorExpenseType(expense) {
        if (expense.expenseTypeId == null || expense.expenseTypeId == "") {
            return { required: true };
        }

        return { };
    }

    hasErrorExpenseAmount(expense) {

        if (expense.amount == null || expense.amount == "") {
            return { required: true };
        } else {
            let amountControl = new FormControl();
            amountControl.setValue(expense.amount);

            let validationResult: any = CustomValidators.numberOnly(amountControl);
            return validationResult;
        }
    }

    hasErrorExpenseDescription(expense) {
        if (expense.description == null || expense.description.trim() == "") {
            return { required: true };
        }

        return { };
    }

    hasErrorRefNumber(expense) {
        if (expense.referenceNumber == null || expense.referenceNumber.trim() == "") {
            return { required: true };
        }

        return { };
    }

    hasErrorRefDate(expense) {
        if (expense.referenceDate == null) {
            return { required: true };
        }

        return { };
    }

    public validateExpenses() {
        for (let expense of this.expenses) {
            if (expense.isActive == 1) {
                let desc: any = this.hasErrorExpenseDescription(expense);
                let refNum: any = this.hasErrorRefNumber(expense);
                let refDate: any = this.hasErrorRefDate(expense);
                let type: any = this.hasErrorExpenseType(expense);
                let amount: any = this.hasErrorExpenseAmount(expense);
                if (desc.required == true
                    || refNum.required == true
                    || refDate.required == true
                    || type.required == true
                    || amount.required == true
                    || amount.nonnumber == true) {
                    return false;
                }
            }
        }

        return true;
    }

    public markAsTouchedAll() {
        for (let expense of this.expenses) {
            expense.expenseTypeTouched = true; 
            expense.amountTouched = true; 
            expense.descTouched = true; 
            expense.refNumberTouched = true; 
            expense.refDateTouched = true;
        }
    }
}