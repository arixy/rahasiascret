﻿import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnDestroy, ViewContainerRef, ComponentFactoryResolver, ComponentRef} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import { GlobalState } from '../../global.state';

import { DataTable, TabViewModule } from "primeng/primeng";

// supporting component
import { UtilityFormComponent } from './forms/utility-form.component';

// services
import { UtilityConsumptionsService } from './utility-consumptions.service';
    
@Component({
  selector: 'utility-consumptions',
  templateUrl: './utility-consumptions.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss', './utility-consumptions.css'],
  entryComponents: [UtilityFormComponent],
  encapsulation: ViewEncapsulation.None
})
export class UtilityConsumptions implements OnDestroy {
    // Subscription object
    private subscription;

    // modal related
    private modalTitle = "Add Consumption";
    // current modal content
    private currentModalContent: any;

    // used fields
    private lstUtilityConsumptions: Array<any>;

    // constants
    private readonly DEFAULT_ITEM_PER_PAGE = 10;
    private readonly DEFAULT_SORT_FIELD = "utilityConsumptionId";

    // to delete
    private utilityConsumptionToDelete;


    // ViewChilds
    @ViewChild('dt') consumptionsTable: DataTable;
    @ViewChild("formModal") formModal: ModalDirective;
    @ViewChild("deleteModal") deleteModal: ModalDirective;

    @ViewChild('dynamicModalBody', { read: ViewContainerRef }) viewModalBody: ViewContainerRef;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private _utilityConsumptionService: UtilityConsumptionsService) {

    }

    ngOnInit() {
        this.subscription = this._utilityConsumptionService.eventEmitted$.subscribe(event => {
            console.log("event: " + event);

            if (event == "utilityConsumptions_btnSaveOnSuccess") {
                this.getAllUtilityConsumptions(this.buildFilter(this.consumptionsTable));
                this.formModal.hide();
            } else if (event == "utilityConsumptions_btnCancelOnClick") {
                this.formModal.hide();
            }
        });
    }

    private getAllUtilityConsumptions(filters) {
        console.log(filters);
        if (filters == null) {
            filters = {
                "filters": {
                },
                "first": 0,
                "multiSortMeta": "undefined",
                "rows": 10,
                "sortField": "id",
                "sortOrder": -1
            };
        }

        this._utilityConsumptionService.getUtilityConsumptions(filters).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.lstUtilityConsumptions = response.data;
            } else {
                // show error message?
            }
        });
    }

    private refresh(event, dataTable: DataTable) {
        this.getAllUtilityConsumptions(this.buildFilter(dataTable));
    }

    private buildFilter(table: DataTable) {
        if (table == null) {
            return {
                "filters": {},
                "first": 0,
                "rows": this.DEFAULT_ITEM_PER_PAGE,
                "globalFilter": "",
                "multiSortMeta": null,
                "sortField": this.DEFAULT_SORT_FIELD,
                "sortOrder": -1
            }
        }
        else {
            return {
                "filters": table.filters,
                "first": table.first,
                "rows": table.rows,
                "globalFilter": table.globalFilter,
                "multiSortMeta": table.multiSortMeta,
                "sortField": table.sortField,
                "sortOrder": table.sortOrder
            };
        }
    }

    resetFilters(table: DataTable) {
        console.log("resetFilters");

        table.filters = {};
        table.globalFilter = "";

        this.getAllUtilityConsumptions(this.buildFilter(table));
    }

    private addUtilityConsumption() {
        this.viewModalBody.clear();

        this.modalTitle = "Add Consumption";

        this.currentModalContent = this.createUtilityFormComponent(this.viewModalBody, UtilityFormComponent);
        this.currentModalContent.instance.formMode = "NEW";

        this.formModal.show();
    }

    private viewUtilityConsumption(utility) {
        this.viewModalBody.clear();

        this.modalTitle = "VIEW Consumption";

        this.currentModalContent = this.createUtilityFormComponent(this.viewModalBody, UtilityFormComponent);
        this.currentModalContent.instance.formMode = "VIEW";
        this.currentModalContent.instance.utilityModel = utility;

        this.formModal.show();
    }

    private editUtilityConsumption(utility) {
        this.viewModalBody.clear();

        this.modalTitle = "Edit Consumption";

        this.currentModalContent = this.createUtilityFormComponent(this.viewModalBody, UtilityFormComponent);
        this.currentModalContent.instance.formMode = "EDIT";
        this.currentModalContent.instance.utilityModel = utility;

        this.formModal.show();
    }

    private deleteUtilityConsumption(utility) {
        this.utilityConsumptionToDelete = new Array(utility);

        this.deleteModal.show();
    }

    cancelDelete() {
        this.utilityConsumptionToDelete = null;

        this.deleteModal.hide();
    }

    saveDelete() {
        this._utilityConsumptionService.deleteUtilityConsumption(this.utilityConsumptionToDelete[0].utilityConsumptionId).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.utilityConsumptionToDelete = null;
                this.deleteModal.hide();

                this.getAllUtilityConsumptions(this.buildFilter(this.consumptionsTable));
            } else {
                // error?
            }
        });
    }

    createUtilityFormComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _utilityConsumptionService, _utilityTypeService, _uomService): UtilityFormComponent }): ComponentRef<UtilityFormComponent> {
        // create content component
        let newComponentContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(newComponentContent);

        return modalContentRef;
    }

    hideChildModal(currentOpenModal) {
        currentOpenModal.hide();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}