import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions } from 'ng2-datepicker';
import { SelectComponent, SelectItem } from 'ng2-select';

import { TaskService } from '../task.service';
import { LocationService } from '../../../services/location.service';
import { AssetService } from '../../../services/asset.service';
import { UsersService } from '../../users/users.service';
import { RoleService } from '../../role/role.service';
import { EntityService } from '../../entities/entity.service';
import { WorkOrderService } from '../../../services/work-order.service';

import { WorkflowActions, WorkOrderStatuses } from '../../../global.state';

@Component({
    selector: 'form-tenant-request',
    templateUrl: './tenantrequest.component.html',
    providers: [LocationService, AssetService, UsersService, RoleService, EntityService, WorkOrderService]
})
export class TenantRequestComponent {
    public selectedWoType: { id, label };
    public actionType: { workflowActionId, name }; // JSON of Action
    public selectedWO = null;

    // flag to disable almost all form
    public disabled = false;

    // forms
    public formGroupAdd;
    public wo_number;
    public task_name;
    public task_desc;
    public location_info;
    public completion_hours;
    public selected_category;
    public selected_asset;
    public selected_location;
    public selected_entity;
    public selected_status;
    public selected_priority;
    public selected_assignee;
    public selected_vendor;
    public contact_person;
    public contact_number;
    public solution;

    public selected_startdate;
    public selected_starttime;
    public selected_duedate;

    // expenses
    public isCanEditExpenses = true;
    public wo_expenses = [{ expenseTypeName: "Pembelian", amount: "120000", description: "", refNumber: "", refDate: new Date() }];

    // files
    public existingFiles;
    public existingPhotos;

    public items_assets: any = [{ text: 'Lampu Maspion', id: 1 }];
    public items_categories: any = [{ text: 'Complaints', id: 1 }];
    public items_locations: any = [{ text: 'Lantai 3', id: 1 }, { text: 'Lantai 5', id: 2 }];
    public items_priorities: any = [{ text: 'High', id: 1 }];
    public items_entities: any = [{ text: 'Obrol', id: 1 }];
    public items_assignees: any = [{ text: 'My Self', id: 1 }];
    public items_statuses: any = [
        { text: 'Scheduled', id: 0 },
        { text: 'Backlog', id: 1 },
        { text: 'New', id: 2 },
        { text: 'In Progress', id: 3 },
        { text: 'Close for Confirmation', id: 4 },
        { text: 'Complete', id: 5 },
        { text: 'Cancel', id: 6 },
        { text: 'Pending', id: 7 },
    ];
    public items_vendors: any = [];

    // error message container
    public error_msg = {
        category: null,
        location: null,
    };

    public _defFieldPermissions = {
        // just put fields that is different from other select box
        // show, hidden, disabled
        default: "show",
        selected_assignee: "show",
        selected_starttime: "show",
        selected_startdate: "show",
        selected_duedate: "show",
        selected_status: "disabled",

        btn_submit: 'show'

    }


    @ViewChild("addLocationSelectBox") _addLocationSelectBox: SelectComponent;
    @ViewChild("addAssetSelectBox") _addAssetSelectBox: SelectComponent;
    @ViewChild("addCategorySelectBox") _addCategorySelectBox: SelectComponent;
    @ViewChild("addAssigneeSelectBox") _addAssigneeSelectBox: SelectComponent;


    constructor(
        public fb: FormBuilder,
        public cdr: ChangeDetectorRef,
        private _taskService: TaskService,
        private _locationService: LocationService,
        private _assetService: AssetService,
        private _userService: UsersService,
        private _roleService: RoleService,
        private _entityService: EntityService,
        private _workOrderService: WorkOrderService
    ) {

    }

    ngOnInit() {
        this.formGroupAdd = this.fb.group({
            'wo_number': ['', null],
            'task_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'task_desc': ['', null],
            'selected_category': ['', null],
            'selected_asset': ['', null],
            'selected_location': ['', null],
            'location_info': ['', null],
            'selected_entity': ['', null],
            'selected_assignee': ['', null],
            'selected_status': ['', null],
            'selected_priority': ['', null],
            'selected_vendor': ['', null],
            'contact_person': ['', null],
            'contact_number': ['', null],
            'solution': ['', null],

            'selected_startdate': ['', null],
            'selected_starttime': ['', null],
            'selected_duedate': ['', null],
        });
        this.wo_number = this.formGroupAdd.controls['wo_number'];
        this.task_name = this.formGroupAdd.controls['task_name'];
        this.task_desc = this.formGroupAdd.controls['task_desc'];
        this.selected_category = this.formGroupAdd.controls['selected_category'];
        this.selected_location = this.formGroupAdd.controls['selected_location'];
        this.selected_asset = this.formGroupAdd.controls['selected_asset'];
        this.location_info = this.formGroupAdd.controls['location_info'];
        this.selected_entity = this.formGroupAdd.controls['selected_entity'];
        this.selected_assignee = this.formGroupAdd.controls['selected_assignee'];
        this.selected_status = this.formGroupAdd.controls['selected_status'];
        this.selected_priority = this.formGroupAdd.controls['selected_priority'];
        this.selected_vendor = this.formGroupAdd.controls['selected_vendor'];
        this.contact_person = this.formGroupAdd.controls['contact_person'];
        this.contact_number = this.formGroupAdd.controls['contact_number'];
        this.solution = this.formGroupAdd.controls['solution'];

        this.selected_startdate = this.formGroupAdd.controls['selected_startdate'];
        this.selected_starttime = this.formGroupAdd.controls['selected_starttime'];
        this.selected_duedate = this.formGroupAdd.controls['selected_duedate'];

        if (this.selectedWO != null) {
            this.loadWorkOrderDataAndSetPermission();
        } else {
            // load all locations
            this._locationService.getLocations().subscribe((locations) => {
                console.log("location response", locations);
                var lstLocations = locations.data;
                this.items_locations = [];
                for (var i = 0; i < lstLocations.length; i++) {
                    this.items_locations.push({ text: lstLocations[i].name, id: lstLocations[i].locationId });
                }
                console.log("items_locations", this.items_locations);
            });

            // load all assets
            this._assetService.getAssets().subscribe((assets) => {
                var lstAssets = assets.data;

                this.items_assets = [];
                for (var i = 0; i < lstAssets.length; i++) {
                    this.items_assets.push({ text: lstAssets[i].name, id: lstAssets[i].assetId });
                }
            });

            // load all users as assignee
            // clear assignee list
            this._userService.getUsers().subscribe((users) => {
                var lstUsers = users.data;

                this.items_assignees = [];
                for (var i = 0; i < lstUsers.length; i++) {
                    this.items_assignees.push({ text: lstUsers[i].fullname, id: lstUsers[i].userId });
                }

                console.log("list assignees", this.items_assignees);
            });
        }

        this.setPermission();
    }

    public setPermission() {
        if (this.actionType.workflowActionId == WorkflowActions.CREATE) {

        } else if (this.actionType.workflowActionId == WorkflowActions.VIEW) {
            this.formGroupAdd.disable();
            this.disabled = true;
            this.isCanEditExpenses = false;
            this._defFieldPermissions.selected_assignee = 'disabled';
            this._defFieldPermissions.btn_submit = 'hide';

        } else if (this.actionType.workflowActionId == WorkflowActions.ASSIGN_REASSIGN
            || this.actionType.workflowActionId == WorkflowActions.RETURN) {
            // do not use FormGroup.disable() because FormGroup.valid will always FALSE
            //this.formGroupAdd.disable();
            this.disabled = true;
            this.isCanEditExpenses = false;

            this.wo_number.disable();
            this.task_name.disable();
            this.task_desc.disable();
            this.selected_category.disable();
            this.selected_location.disable();
            this.location_info.disable();
            this.selected_status.disable();
            this.selected_priority.disable();
            this.selected_vendor.disable();
            this.contact_person.disable();
            this.contact_number.disable();
            this.solution.disable();

            this.selected_startdate.disable();
            this.selected_starttime.disable();
            this.selected_duedate.disable();

            this._defFieldPermissions.selected_assignee = "show";
            //this._defFieldPermissions.selected_startdate = "show";
            //this._defFieldPermissions.selected_starttime = "show";
            //this._defFieldPermissions.selected_duedate = "show";

        } else if (this.actionType.workflowActionId == WorkflowActions.CANCEL
            || this.actionType.workflowActionId == WorkflowActions.PENDING
            || this.actionType.workflowActionId == WorkflowActions.IN_PROGRESS) {
            // disable all
            this.disabled = true;
            this.isCanEditExpenses = false;

            this.wo_number.disable();
            this.task_name.disable();
            this.task_desc.disable();
            this.selected_category.disable();
            this.selected_location.disable();
            this.location_info.disable();
            this.selected_status.disable();
            this.selected_priority.disable();
            this.selected_vendor.disable();
            this.contact_person.disable();
            this.contact_number.disable();
            this.solution.disable();

            this._defFieldPermissions.selected_assignee = "disabled";
            //this._defFieldPermissions.selected_startdate = "disabled";
            //this._defFieldPermissions.selected_starttime = "disabled";
            //this._defFieldPermissions.selected_duedate = "disabled";

            this.selected_startdate.disable();
            this.selected_starttime.disable();
            this.selected_duedate.disable();
        } else if (this.actionType.workflowActionId == WorkflowActions.COMPLETE
            || this.actionType.workflowActionId == WorkflowActions.CLOSE_FOR_CONFIRMATION) {
            try {
                this.wo_number.disable();
                this.task_name.disable();
                this.task_desc.disable();
                this.selected_category.disable();
                this.selected_asset.disable();
                this.selected_priority.disable();
                this.selected_status.disable();
                this.selected_location.disable();
                this.location_info.disable();
                this.contact_number.disable();
                this.contact_person.disable();

                this.selected_startdate.disable();
                this.selected_starttime.disable();
                this.selected_duedate.disable();

                this._defFieldPermissions.selected_assignee = "disabled";
            } catch (e) {
                console.log("ERROR", e);
            }
        } else if (this.actionType.workflowActionId == WorkflowActions.EDIT) {
            this.wo_number.disable();
            this._defFieldPermissions.selected_assignee = "disabled";
            this._defFieldPermissions.selected_status = "disabled";

            // filter by status
            //if (this.selectedWO.currentStatusId == )
        } else {
            // unknown mode, disable all
            this.disabled = true;
            this.isCanEditExpenses = false;
            this.formGroupAdd.disable();

            this._defFieldPermissions.selected_assignee = "disabled";
            this._defFieldPermissions.selected_status = "disabled";
        }
    }

    private loadWorkOrderDataAndSetPermission() {
        // reload WO Data
        this._taskService.getMyTaskById(this.selectedWO.workOrderId).subscribe((response) => {
            console.log("work-order/get response:", response.data);

            if (response.resultCode.code != 0) {
                // something error
                // should return?
            }
            this.selectedWO = response.data.workOrder;
            this.existingFiles = response.data.files;
            this.existingPhotos = response.data.photos;

            // show current values
            this.formGroupAdd.patchValue({
                "wo_number": this.selectedWO.woNumber,
                "task_name": this.selectedWO.taskName,
                "task_desc": this.selectedWO.description,
                "location_info": this.selectedWO.locationInfo,
                "contact_person": this.selectedWO.contactPerson,
                "contact_number": this.selectedWO.contactNumber,

                "selected_startdate": new Date(this.selectedWO.startDate),
                "selected_starttime": new Date(this.selectedWO.startDate + " " + this.selectedWO.startTime),
                //"selected_duedate": new Date(this.selectedWO.dueDate)
            });

            //this.selected_startdate.setValue(new Date(this.selectedWO.startDate));

            // load all other required items
            // then set default value for select box

            this._locationService.getLocations().subscribe((locations) => {
                console.log("location response", locations);
                var lstLocations = locations.data;
                this.items_locations = [];
                for (var i = 0; i < lstLocations.length; i++) {
                    var currentItem = { text: lstLocations[i].name, id: lstLocations[i].locationId };
                    this.items_locations.push(currentItem);

                    if (currentItem.id == this.selectedWO.locationId) {
                        this.selected_location = currentItem;
                        this._addLocationSelectBox.active = [currentItem];
                    }
                }
                console.log("items_locations", this.items_locations);
            });

            // load entities


            // load all assets
            this._assetService.getAssets().subscribe((assets) => {
                var lstAssets = assets.data;

                this.items_assets = [];
                for (var i = 0; i < lstAssets.length; i++) {
                    var currentItem = { text: lstAssets[i].name, id: lstAssets[i].assetId };
                    this.items_assets.push(currentItem);

                    if (currentItem.id == this.selectedWO.assetId) {
                        console.log("Matching Asset with WO's Asset", currentItem);
                        this.selected_asset = currentItem;
                        this._addAssetSelectBox.active = [currentItem];
                    }
                }
            });

            // load all users as assignee
            if (this.selectedWO.currentAssigneeId != null) {
                this._userService.getUsers().subscribe((users) => {
                    var lstUsers = users.data;
                    console.log(lstUsers);

                    // clear assignee list
                    this.items_assignees = [];
                    for (var i = 0; i < lstUsers.length; i++) {
                        this.items_assignees.push({ text: lstUsers[i].fullname, id: lstUsers[i].userId });

                        if (lstUsers[i].userId == this.selectedWO.currentAssigneeId) {
                            //this.selected_
                            this._addAssigneeSelectBox.active = [{ text: lstUsers[i].fullname, id: lstUsers[i].userId }];
                        }
                    }
                });
            } else if (this.selectedWO.currentAssigneeId != null) {

            }

        });

        // PERMISSION SHOULD BE HERE
    }

    // btn submit
    public onSubmit(formValue) {
        console.log("onSubmit", formValue);

        try {
            if (this.formGroupAdd.valid) {
                console.log("valid");

                // handle manual validation

                // manual validation VALID

                var formatted_object = Object.assign({}, {
                    workOrderId: this.selectedWO == null ? null : this.selectedWO.workOderId,
                    woNumber: this.wo_number.value,
                    woTypeId: this.selectedWoType.id,
                    taskName: this.task_name.value,
                    description: this.task_desc.value,
                    woCategoryId: this.selected_category.value.id,
                    woPriorityId: this.selected_priority.value.id,
                    entityId: null, // ?
                    locationId: this.selected_location.value.id,
                    locationInfo: this.location_info.value,
                    assetId: this.selected_asset.value.id,
                    currentStatusId: this.selected_status.value.id,
                    // TODO: check later
                    currentAssigneeId: this.selected_assignee.value.id,
                    // TODO: check later
                    mainPicId: this.selected_assignee.value.id,
                    // TODO: need to change to UTC+0 first
                    startDate: this.selected_startdate.value,
                    repeatOptionId: null,
                    every: null,
                    everyPeriodId: null,
                    dueAfter: null,
                    duePeriodId: null,
                    // TODO: need to change to UTC+0 first
                    dueDate: this.selected_duedate.value,
                    lastWoDate: null,
                    nextWoDate: null,
                    completeDateTime: null,
                    completionHours: null,
                    pendingHours: null,
                    isComplete: false,
                    workflowId: null,
                    contactPerson: this.contact_person.value,
                    contactNumber: this.contact_number.value,
                    solution: this.solution.value,
                    expenses: this.wo_expenses
                });

                console.log("To Send", formatted_object);
            }
        } catch (e) {
            console.log("ERROR", e);
        }

        return false;
    }

    private selectedDate(dateField: string, event) {
        console.log("selectedDate", dateField, event);
        //switch (dateField.toLowerCase()) {
        //    case 'selected_startdate': selected_startdate = event.value; break;
        //    case 'selected_duedate': break;
        //}
    }

    private selectedStartTime(event) {
        console.log("selectedStartTime", event);
    }

    selectedSelectBoxValue(field, event) {
        console.log("selectedSelectBoxValue", field, event);

        // handle every possible field here
        switch (field.toLowerCase()) {
            case 'selected_priority': this.selected_priority.setValue(event); break;
            case 'selected_assignee': this.selected_assignee.setValue(event); break;
            case 'selected_location': this.selected_location.setValue(event); break;
            case 'selected_entity': this.selected_entity.setValue(event); break;
            case 'selected_status': this.selected_status.setValue(event); break;
            case 'selected_asset': this.selected_asset.setValue(event); break;
            case 'selected_category': this.selected_category.setValue(event); break;
        }
    }

    // btn cancel
    onCancel() {
        console.log("cancel");
        this._taskService.announceEvent("addNewModal_btnCancelOnClick");
    }
}