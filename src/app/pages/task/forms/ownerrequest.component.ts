import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, FormControl } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions } from 'ng2-datepicker';
import { SelectComponent, SelectItem } from 'ng2-select';
import * as moment from 'moment';
import { TabPanel } from 'primeng/primeng';

import { WorkOrderFilesComponent } from './subforms/workorder-files.component';
import { WorkOrderExpensesComponent } from './subforms/workorder-expenses.component';

import { TaskService } from '../task.service';
import { LocationService } from '../../../services/location.service';
import { AssetService } from '../../../services/asset.service';
import { UsersService } from '../../users/users.service';
import { RoleService } from '../../role/role.service';
import { EntityService } from '../../entities/entity.service';
import { WorkOrderService } from '../../../services/work-order.service';
import { ExpenseTypeService } from '../../expense-type/expense-type.service';
import { PriorityService } from '../../priorities/priority.service';

import { GlobalConfigs, WorkflowActions, WorkOrderStatuses } from '../../../global.state';
import { GrowlMessage, MessageSeverity, MessageLabels } from '../../../popup-notification';

import { CustomValidators } from './custom-validators';

@Component({
    selector: 'form-owner-request',
    templateUrl: './ownerrequest.component.html',
    providers: [LocationService, AssetService, UsersService, RoleService, EntityService, WorkOrderService, ExpenseTypeService, PriorityService, EntityService]
})
export class OwnerRequestComponent {
    public selectedWoType: { id, label };
    public actionType: { workflowActionId, name, toRoleId, toRoleTypeId, toUserId }; // JSON of Action
    public selectedWO = null;

    // const
    private _yearRange = GlobalConfigs.yearRange;

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
    //public selected_starttime;
    public selected_duedate;

    // expenses
    public isCanEditExpenses = true;
    public wo_expenses = [];

    // files
    public isCanEditFiles = true;
    public existingFiles = [];
    public existingPhotos = [];

    public items_assets: any = [];
    public items_categories: any = [];
    public items_locations: any = [];
    public items_priorities: any = [];
    public items_entities: any = [];
    public items_assignees: any = [];
    public items_statuses: any = [
        { text: 'Scheduled', id: 0 },
        { text: 'Backlog', id: 1 },
        { text: 'New', id: 2 },
        { text: 'In Progress', id: 3 },
        { text: 'Close for Confirmation', id: 4 },
        { text: 'Complete', id: 5 },
        { text: 'Cancel', id: 6 },
        { text: 'Pending', id: 7 },
        { text: 'Escalated', id: 8 },
        { text: 'Return', id: 9 },
    ];
    public items_vendors: any = [];
    public items_expenses_types: any = [];

    // error message container
    public error_msg = {
        category: null,
        location: null,
    };

    private errMsg = [];

    public _defFieldPermissions = {
        default: "show",
        btn_submit: 'show'
    }

    // loading state
    private loadingState = {
        isLoading: () => {
            return this.loadingState.workOrder || this.loadingState.expenses || this.loadingState.files || this.loadingState.location
                || this.loadingState.category || this.loadingState.priority || this.loadingState.assignee || this.loadingState.asset
                || this.loadingState.vendor || this.loadingState.owner || this.loadingState.repeatOption || this.loadingState.repeatPeriod
                || this.loadingState.duePeriod || this.loadingState.expenseType || this.loadingState.saving;
        },
        // work order data
        workOrder: false,
        expenses: false,
        files: false,
        saving: false,

        // lookup
        location: false,
        category: false,
        priority: false,
        assignee: false,
        asset: false,
        vendor: false,
        owner: false,
        repeatOption: false,
        repeatPeriod: false,
        duePeriod: false,
        expenseType: false,
    };

    @ViewChild("addStatusSelectBox") _addStatusSelectBox: SelectComponent;
    @ViewChild("addLocationSelectBox") _addLocationSelectBox: SelectComponent;
    @ViewChild("addAssetSelectBox") _addAssetSelectBox: SelectComponent;
    @ViewChild("addCategorySelectBox") _addCategorySelectBox: SelectComponent;
    @ViewChild("addPrioritySelectBox") _addPrioritySelectBox: SelectComponent;
    @ViewChild("addAssigneeSelectBox") _addAssigneeSelectBox: SelectComponent;
    @ViewChild("addVendorSelectBox") _addVendorSelectBox: SelectComponent;
    @ViewChild("addEntitySelectBox") _addEntitySelectBox: SelectComponent;

    // child component
    @ViewChild(WorkOrderFilesComponent) _workOrderFilesComponent: WorkOrderFilesComponent;
    @ViewChild(WorkOrderExpensesComponent) _workOrderExpensesComponent: WorkOrderExpensesComponent;

    // Tab Panels
    @ViewChild("generalTab") _generalTab: TabPanel;
    @ViewChild("filesTab") _filesTab: TabPanel;
    @ViewChild("expensesTab") _expensesTab: TabPanel;

    constructor(
        public fb: FormBuilder,
        public cdr: ChangeDetectorRef,
        private _taskService: TaskService,
        private _locationService: LocationService,
        private _assetService: AssetService,
        private _userService: UsersService,
        private _roleService: RoleService,
        private _workOrderService: WorkOrderService,
        private _expenseTypeService: ExpenseTypeService,
        private _priorityService: PriorityService,
        private _entityService: EntityService
    ) {

    }

    ngOnInit() {
        this.formGroupAdd = this.fb.group({
            'wo_number': ['', null],
            'task_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'task_desc': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'selected_category': ['', Validators.compose([Validators.required])],
            'selected_asset': ['', null],
            'selected_location': ['', Validators.compose([Validators.required])],
            'location_info': ['', null],
            'selected_entity': ['', Validators.compose([Validators.required])],
            'selected_assignee': ['', null],
            'selected_status': ['', null],
            'selected_priority': ['', Validators.compose([Validators.required])],
            'selected_vendor': ['', null],
            'contact_person': ['', null],
            'contact_number': ['', Validators.compose([CustomValidators.numberOnly])],
            'solution': ['', Validators.compose([this.validateSolution.bind(this)])],

            'selected_startdate': ['', Validators.compose([Validators.required, this.validateStartDueDate.bind(this)])],
            //'selected_starttime': ['', null],
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
        //this.selected_starttime = this.formGroupAdd.controls['selected_starttime'];
        this.selected_duedate = this.formGroupAdd.controls['selected_duedate'];

        // bind value changes for date
        //  used for validation of cross date
        this.selected_startdate.valueChanges.debounceTime(50).subscribe(data => {
            this.selected_startdate.updateValueAndValidity();
        });
        this.selected_duedate.valueChanges.debounceTime(50).subscribe(data => {
            this.selected_startdate.updateValueAndValidity();
        });

        if (this.selectedWO != null) {
            this.loadWorkOrderDataAndSetPermission();
        } else {
            // get vendors
            this.loadingState.vendor = true;
            this._entityService.getEntitiesByType(1).subscribe((response) => {
                console.log("vendors", response.data);

                var tmpLstVendors = response.data;
                this.items_vendors = [];
                for (var i = 0; i < tmpLstVendors.length; i++) {
                    var currentItem = { id: tmpLstVendors[i].entityId, text: tmpLstVendors[i].name };
                    this.items_vendors.push(currentItem);
                }
                this.loadingState.vendor = false;
            });

            // get priorities
            this.loadingState.priority = true;
            this._priorityService.getPriorities().subscribe((response) => {
                console.log("priorities", response.data);

                var tmpLstPriorities = response.data;
                this.items_priorities = [];
                for (var i = 0; i < tmpLstPriorities.length; i++) {
                    var currentItem = { id: tmpLstPriorities[i].woPriorityId, text: tmpLstPriorities[i].name };
                    this.items_priorities.push(currentItem);
                }
                this.loadingState.priority = false;
            });

            // get categories
            this.loadingState.category = true;
            this._workOrderService.getWOs().subscribe((response) => {
                console.log("categories response", response.data);

                var tmpLstCategories = response.data;
                this.items_categories = [];
                for (var i = 0; i < tmpLstCategories.length; i++) {
                    var currentItem = { id: tmpLstCategories[i].woCategoryId, text: tmpLstCategories[i].name };
                    this.items_categories.push(currentItem);
                }
                this.loadingState.category = false;
            });

            // load entities: owner
            this.loadingState.owner = true;
            this._entityService.getEntitiesByType(4).subscribe((response) => {
                console.log("entity:owners", response.data);

                var tmpLstEntities = response.data;
                this.items_entities = [];
                for (var i = 0; i < tmpLstEntities.length; i++) {
                    var currentItem = { id: tmpLstEntities[i].entityId, text: tmpLstEntities[i].name };
                    this.items_entities.push(currentItem);
                }
                this.loadingState.owner = false;
            });

            // load all locations
            this.loadingState.location = true;
            this._locationService.getLocationsLeaf().subscribe((locations) => {
                console.log("location response", locations);
                var lstLocations = locations.data;
                this.items_locations = [];
                for (var i = 0; i < lstLocations.length; i++) {
                    this.items_locations.push({ text: lstLocations[i].name, id: lstLocations[i].locationId });
                }
                console.log("items_locations", this.items_locations);
                this.loadingState.location = false;
            });

            // load all assets
            this.loadingState.asset = true;
            this._assetService.getAssets().subscribe((assets) => {
                var lstAssets = assets.data;

                this.items_assets = [];
                for (var i = 0; i < lstAssets.length; i++) {
                    this.items_assets.push({ text: lstAssets[i].name, id: lstAssets[i].assetId });
                }
                this.loadingState.asset = false;
            });

            // load all users as assignee
            // clear assignee list
            this.loadingState.assignee = true;
            this._userService.getAssigneeByTypeId("User", 1).subscribe((users) => {
                var lstUsers = users.data;

                this.items_assignees = [];
                for (var i = 0; i < lstUsers.length; i++) {
                    this.items_assignees.push({ text: lstUsers[i].fullname, id: lstUsers[i].userId });
                }

                console.log("list assignees", this.items_assignees);
                this.loadingState.assignee = false;
            });
        }

        this.formGroupAdd.valueChanges.subscribe(data => {
            if (this.formGroupAdd.valid) {
                this._generalTab.headerStyleClass = '';
            }
        });
    }

    private loadWorkOrderDataAndSetPermission() {
        // reload WO Data
        this.loadingState.workOrder = true;
        this._taskService.getMyTaskById(this.selectedWO.workOrderId).subscribe((response) => {
            console.log("work-order/get response:", response.data);

            if (response.resultCode.code != 0) {
                // something error
                // should return?
            }
            this.selectedWO = response.data.workOrder;
            this.existingFiles = response.data.files;
            this.existingPhotos = response.data.photos;
            this.wo_expenses = response.data.expenses;

            // loop wo_expenses to set active item to be used in workorder-expenses.component
            for (var woe = 0; woe < this.wo_expenses.length; woe++) {
                this.wo_expenses[woe].active = [{ id: this.wo_expenses[woe].expenseTypeId, text: this.wo_expenses[woe].expenseTypeName }];
                this.wo_expenses[woe].referenceDate = new Date(this.wo_expenses[woe].referenceDate);
            }

            // show current values
            this.formGroupAdd.patchValue({
                "wo_number": this.selectedWO.woNumber,
                "task_name": this.selectedWO.taskName,
                "task_desc": this.selectedWO.description,
                "location_info": this.selectedWO.locationInfo,
                "contact_person": this.selectedWO.contactPerson,
                "contact_number": this.selectedWO.contactNumber,
                "solution": this.selectedWO.solution,

                //"selected_startdate": new Date(this.selectedWO.startDate),
                //"selected_starttime": new Date(this.selectedWO.startDate + " " + this.selectedWO.startTime),
                "selected_startdate": new Date(this.selectedWO.startDate + "T" + this.selectedWO.startTime + "Z"),
                "selected_duedate": this.selectedWO.dueDate == null ? null : new Date(this.selectedWO.dueDate)
            });

            //this.selected_startdate.setValue(new Date(this.selectedWO.startDate));

            // load all other required items
            // then set default value for select box

            // statuses
            for (var i = 0; i < this.items_statuses.length; i++) {
                if (this.items_statuses[i].id == this.selectedWO.currentStatusId) {
                    this.selected_status.setValue(this.items_statuses[i]);
                    this._addStatusSelectBox.active = [this.items_statuses[i]];
                }
            }

            // get vendors
            this.loadingState.vendor = true;
            this._entityService.getEntitiesByType(1).subscribe((response) => {
                console.log("vendors", response.data);

                var tmpLstVendors = response.data;
                this.items_vendors = [];
                for (var i = 0; i < tmpLstVendors.length; i++) {
                    var currentItem = { id: tmpLstVendors[i].entityId, text: tmpLstVendors[i].name };
                    this.items_vendors.push(currentItem);

                    if (currentItem.id == this.selectedWO.vendorId) {
                        //this.selected_cate = currentItem;
                        this.selected_vendor.setValue(currentItem);
                        this._addVendorSelectBox.active = [currentItem];
                    }
                }
                this.loadingState.vendor = false;
            });

            // get priorities
            this.loadingState.priority = true;
            this._priorityService.getPriorities().subscribe((response) => {
                console.log("priorities", response.data);

                var tmpLstPriorities = response.data;
                this.items_priorities = [];
                for (var i = 0; i < tmpLstPriorities.length; i++) {
                    var currentItem = { id: tmpLstPriorities[i].woPriorityId, text: tmpLstPriorities[i].name };
                    this.items_priorities.push(currentItem);

                    if (currentItem.id == this.selectedWO.woPriorityId) {
                        //this.selected_cate = currentItem;
                        this.selected_priority.setValue(currentItem);
                        this._addPrioritySelectBox.active = [currentItem];
                    }
                }
                this.loadingState.priority = false;
            });

            // get categories
            this.loadingState.category = true;
            this._workOrderService.getWOs().subscribe((response) => {
                console.log("categories response", response.data);

                var tmpLstCategories = response.data;
                this.items_categories = [];
                for (var i = 0; i < tmpLstCategories.length; i++) {
                    var currentItem = { id: tmpLstCategories[i].woCategoryId, text: tmpLstCategories[i].name };
                    this.items_categories.push(currentItem);

                    if (currentItem.id == this.selectedWO.woCategoryId) {
                        //this.selected_cate = currentItem;
                        this.selected_category.setValue(currentItem);
                        this._addCategorySelectBox.active = [currentItem];
                    }
                }
                this.loadingState.category = false;
            });

            // get locations
            this.loadingState.location = true;
            this._locationService.getLocationsLeaf().subscribe((locations) => {
                console.log("location response", locations);
                var lstLocations = locations.data;
                this.items_locations = [];
                for (var i = 0; i < lstLocations.length; i++) {
                    var currentItem = { text: lstLocations[i].name, id: lstLocations[i].locationId };
                    this.items_locations.push(currentItem);

                    if (currentItem.id == this.selectedWO.locationId) {
                        //this.selected_location = currentItem;
                        this.selected_location.setValue(currentItem);
                        this._addLocationSelectBox.active = [currentItem];
                    }
                }
                console.log("items_locations", this.items_locations);
                this.loadingState.location = false;
            });

            // load entities: owner
            this.loadingState.owner = true;
            this._entityService.getEntitiesByType(4).subscribe((response) => {
                console.log("entity:owners", response.data);

                var tmpLstEntities = response.data;
                this.items_entities = [];
                for (var i = 0; i < tmpLstEntities.length; i++) {
                    var currentItem = { id: tmpLstEntities[i].entityId, text: tmpLstEntities[i].name };
                    this.items_entities.push(currentItem);

                    if (currentItem.id == this.selectedWO.entityId) {
                        //this.selected_cate = currentItem;
                        this.selected_entity.setValue(currentItem);
                        this._addEntitySelectBox.active = [currentItem];
                    }
                }
                this.loadingState.owner = false;
            });

            // load all assets
            this.loadingState.asset = true;
            this._assetService.getAssets().subscribe((assets) => {
                var lstAssets = assets.data;

                this.items_assets = [];
                for (var i = 0; i < lstAssets.length; i++) {
                    var currentItem = { text: lstAssets[i].name, id: lstAssets[i].assetId };
                    this.items_assets.push(currentItem);

                    if (currentItem.id == this.selectedWO.assetId) {
                        console.log("Matching Asset with WO's Asset", currentItem);
                        this.selected_asset.setValue(currentItem);
                        this._addAssetSelectBox.active = [currentItem];
                    }
                }
                this.loadingState.asset = false;
            });

            // TODO: update this part
            // load all users as assignee
            if (this.actionType.toRoleId != null) {
                console.log("get assignee by type: Role", this.actionType);
                this.loadingState.assignee = true;
                this._userService.getAssigneeByTypeId("Role", this.actionType.toRoleId).subscribe((users) => {
                    var lstUsers = users.data;
                    console.log(lstUsers);

                    // clear assignee list
                    this.items_assignees = [];
                    for (var i = 0; i < lstUsers.length; i++) {
                        var currentItem = { text: lstUsers[i].fullname, id: lstUsers[i].userId };
                        this.items_assignees.push(currentItem);

                        if (currentItem.id == this.selectedWO.currentAssigneeId) {
                            this.selected_assignee.setValue(currentItem);
                            this._addAssigneeSelectBox.active = [currentItem];
                        }
                    }
                    this.loadingState.assignee = false;
                });
            } else if (this.actionType.toRoleTypeId != null) {
                console.log("get assignee by type: RoleType", this.actionType);
                this.loadingState.assignee = true;
                this._userService.getAssigneeByTypeId("RoleType", this.actionType.toRoleTypeId).subscribe((users) => {
                    var lstUsers = users.data;
                    console.log(lstUsers);

                    // clear assignee list
                    this.items_assignees = [];
                    for (var i = 0; i < lstUsers.length; i++) {
                        var currentItem = { text: lstUsers[i].fullname, id: lstUsers[i].userId };
                        this.items_assignees.push(currentItem);

                        if (currentItem.id == this.selectedWO.currentAssigneeId) {
                            this.selected_assignee.setValue(currentItem);
                            this._addAssigneeSelectBox.active = [currentItem];
                        }
                    }
                    this.loadingState.assignee = false;
                });
            } else {
                console.log("get assignee by type: user");
                this.loadingState.assignee = true;
                this._userService.getAssigneeByTypeId("User", 1).subscribe((users) => {
                    var lstUsers = users.data;
                    console.log(lstUsers);

                    // clear assignee list
                    this.items_assignees = [];
                    for (var i = 0; i < lstUsers.length; i++) {
                        var currentItem = { text: lstUsers[i].fullname, id: lstUsers[i].userId };
                        this.items_assignees.push(currentItem);

                        if (currentItem.id == this.selectedWO.currentAssigneeId) {
                            this.selected_assignee.setValue(currentItem);
                            this._addAssigneeSelectBox.active = [currentItem];
                        }
                    }
                    this.loadingState.assignee = false;
                });
            }

            // PERMISSION SHOULD BE HERE
            if (this.actionType.workflowActionId == WorkflowActions.CREATE) {

            } else if (this.actionType.workflowActionId == WorkflowActions.VIEW) {
                this.formGroupAdd.disable();
                this.disabled = true;
                this.isCanEditExpenses = false;
                this.isCanEditFiles = false;
                this.selected_assignee.disable();
                //this._defFieldPermissions.selected_assignee = 'disabled';
                this._defFieldPermissions.btn_submit = 'hide';

            } else if (this.actionType.workflowActionId == WorkflowActions.ASSIGN_REASSIGN) {
                // do not use FormGroup.disable() because FormGroup.valid will always FALSE
                //this.formGroupAdd.disable();
                this.disabled = true;
                this.isCanEditExpenses = false;
                this.isCanEditFiles = false;

                this.wo_number.disable();
                this.task_name.disable();
                this.task_desc.disable();
                this.selected_category.disable();
                this.selected_location.disable();
                this.location_info.disable();
                this.selected_status.disable();
                this.selected_priority.disable();
                this.selected_entity.disable();
                this.selected_vendor.disable();
                this.contact_person.disable();
                this.contact_number.disable();
                this.solution.disable();

                this.selected_startdate.disable();
                //this.selected_starttime.disable();
                this.selected_duedate.disable();

                //this._defFieldPermissions.selected_assignee = "show";
                //this._defFieldPermissions.selected_startdate = "show";
                //this._defFieldPermissions.selected_starttime = "show";
                //this._defFieldPermissions.selected_duedate = "show";

            } else if (this.actionType.workflowActionId == WorkflowActions.CANCEL
                || this.actionType.workflowActionId == WorkflowActions.PENDING
                || this.actionType.workflowActionId == WorkflowActions.IN_PROGRESS
                || this.actionType.workflowActionId == WorkflowActions.RETURN) {
                // disable all
                this.disabled = true;
                this.isCanEditExpenses = false;
                this.isCanEditFiles = false;

                this.wo_number.disable();
                this.task_name.disable();
                this.task_desc.disable();
                this.selected_category.disable();
                this.selected_location.disable();
                this.location_info.disable();
                this.selected_status.disable();
                this.selected_priority.disable();
                this.selected_vendor.disable();
                this.selected_entity.disable();
                this.contact_person.disable();
                this.contact_number.disable();
                this.solution.disable();
                this.selected_assignee.disable();

                this.selected_startdate.disable();
                //this.selected_starttime.disable();
                this.selected_duedate.disable();
            } else if (this.actionType.workflowActionId == WorkflowActions.COMPLETE
                || this.actionType.workflowActionId == WorkflowActions.CLOSE_FOR_CONFIRMATION) {
                //this.isCanEditExpenses = false;
                this.isCanEditFiles = false;

                this.wo_number.disable();
                this.task_name.disable();
                this.task_desc.disable();
                this.selected_category.disable();
                this.selected_asset.disable();
                this.selected_priority.disable();
                this.selected_status.disable();
                this.selected_location.disable();
                this.selected_entity.disable();
                this.location_info.disable();
                this.contact_number.disable();
                this.contact_person.disable();
                this.selected_assignee.disable();

                this.selected_startdate.disable();
                //this.selected_starttime.disable();
                this.selected_duedate.disable();

                //this._defFieldPermissions.selected_assignee = "disabled";
            } else if (this.actionType.workflowActionId == WorkflowActions.EDIT) {
                this.wo_number.disable();
                this.selected_assignee.disable();
                this.selected_status.disable();

                // filter by status
                //if (this.selectedWO.currentStatusId == )
            } else {
                // unknown mode, disable all
                this.disabled = true;
                this.isCanEditExpenses = false;
                this.isCanEditFiles = false;
                this.formGroupAdd.disable();

                //this._defFieldPermissions.selected_assignee = "disabled";
                //this._defFieldPermissions.selected_status = "disabled";
            }
            this.loadingState.workOrder = false;
        });
    }

    // btn submit
    public onSubmit(formValue) {
        console.log("onSubmit", formValue);

        try {
            this._generalTab.headerStyleClass = '';
            this._filesTab.headerStyleClass = '';
            this._expensesTab.headerStyleClass = '';
            var hasError = false;

            if (!this.formGroupAdd.valid) {
                this.markAsTouchedAll();
                this._generalTab.headerStyleClass = 'tabpanel-has-error';
                hasError = true;
            }

            if (!this._workOrderFilesComponent.validateFiles() || !this._workOrderFilesComponent.validatePhotos()) {
                this._workOrderFilesComponent.markAsTouchedAll();
                this._filesTab.headerStyleClass = 'tabpanel-has-error';
                hasError = true;
            }

            if (!this._workOrderExpensesComponent.validateExpenses()) {
                this._workOrderExpensesComponent.markAsTouchedAll();
                this._expensesTab.headerStyleClass = 'tabpanel-has-error';
                hasError = true;
            }

            if (hasError) {
                return;
            }

            if (this.formGroupAdd.valid
                && this._workOrderExpensesComponent.validateExpenses()
                && this._workOrderFilesComponent.validateFiles()
                && this._workOrderFilesComponent.validatePhotos()){
                console.log("valid");

                // handle manual validation

                // manual validation VALID

                var workorder_object = Object.assign({}, {
                    workOrderId: this.selectedWO == null ? null : this.selectedWO.workOrderId,
                    woNumber: this.wo_number.value,
                    woTypeId: this.selectedWO == null ? this.selectedWoType.id : this.selectedWO.woTypeId,
                    taskName: this.task_name.value,
                    description: this.task_desc.value,
                    woCategoryId: this.selected_category.value.id,
                    woPriorityId: this.selected_priority.value.id,
                    entityId: this.selected_entity.value.id,
                    locationId: this.selected_location.value.id,
                    locationInfo: this.location_info.value,
                    assetId: this.selected_asset.value.id,
                    currentStatusId: this.selected_status.value.id,
                    // TODO: check later
                    currentAssigneeId: this.selected_assignee.value.id,
                    // TODO: check later
                    //mainPicId: this.selected_assignee.value.id,
                    // TODO: need to change to UTC+0 first
                    startDate: this.selected_startdate.value,
                    startTime: this.selected_startdate.value,
                    repeatOptionId: null,
                    every: null,
                    everyPeriodId: null,
                    dueAfter: null,
                    duePeriodId: null,
                    // TODO: need to change to UTC+0 first
                    dueDate: this.selected_duedate.value == null || this.selected_duedate.value == "" ? null : moment(this.selected_duedate.value).format("YYYY-MM-DD"),
                    lastWoDate: null,
                    nextWoDate: null,
                    completeDateTime: null,
                    completionHours: null,
                    pendingHours: null,
                    isComplete: false,
                    workflowId: this.selectedWO == null ? null : this.selectedWO.workflowId,
                    contactPerson: this.contact_person.value,
                    contactNumber: this.contact_number.value,
                    solution: this.solution.value,
                    vendorId: this.selected_vendor.value == null || this.selected_vendor.value == "" ? null : this.selected_vendor.value.id
                });

                var formatted_object = {
                    workOrder: workorder_object,
                    action: {
                        actionId: this.actionType.workflowActionId,
                        actionName: this.actionType.name
                    },
                    expenses: this.readyExpenses(),
                    deletedExpenses: this.readyDeletedExpenses(),
                    files: this.readyFilesData(),
                    deletedFiles: this.readyDeletedFilesData(),
                    photos: this.readyPhotosData(),
                    deletedPhotos: this.readyDeletedPhotosData(),
                };

                let formData: FormData = new FormData();
                formData.append("params", JSON.stringify(formatted_object));

                // Loop through New Files & Photo, append to FormData
                for (var i = 0; i < this.existingFiles.length; i++) {
                    if (this.existingFiles[i].isActive == false) continue;
                    if (this.existingFiles[i].isActive && this.existingFiles[i].workOrderFileId == null) {
                        let actualFile: File = this.existingFiles[i].actualFile;
                        formData.append("files", actualFile);
                    }
                }

                for (var i = 0; i < this.existingPhotos.length; i++) {
                    if (this.existingPhotos[i].isActive == false) continue;
                    if (this.existingPhotos[i].isActive && this.existingPhotos[i].workOrderPhotoId == null) {
                        let actualFile: File = this.existingPhotos[i].actualFile;
                        formData.append("photos", actualFile);
                    }
                }

                console.log("To Send", formatted_object);

                // TODO: change function name and maybe location?
                if (this.actionType.workflowActionId == WorkflowActions.CREATE) {
                    this._taskService.addNewWorkOrder(formData).subscribe((response) => {
                        console.log("save response", response);
                        if (response.resultCode.code == 0) {
                            this._taskService.announceEvent("addNewModal_btnSaveOnClick_createSuccess");
                            GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                        } else {
                            // an error occured
                            this.errMsg = [];
                            this.errMsg = this.errMsg.concat(response.resultCode.message);
                            GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.SAVE_ERROR);
                        }
                    });
                } else {
                    this._taskService.updateWorkOrder(formData).subscribe((response) => {
                        console.log("update response", response);
                        if (response.resultCode.code == 0) {
                            this._taskService.announceEvent("addNewModal_btnSaveOnClick_updateSuccess");
                            GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                        } else {
                            // an error occured
                            this.errMsg = [];
                            this.errMsg = this.errMsg.concat(response.resultCode.message);
                            GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.SAVE_ERROR);
                        }
                    });
                }
            }
        } catch (e) {
            console.log("ERROR", e);
        }

        return false;
    }

    // btn cancel
    onCancel() {
        console.log("cancel");
        this._taskService.announceEvent("addNewModal_btnCancelOnClick");
    }

    onPrint() {
        this._taskService.announceEvent("printWO");
    }

    removeSelectBoxValue(field, event) {
        console.log("removeSelectBoxValue", field, event);

        // handle every possible field here
        switch (field.toLowerCase()) {
            case 'selected_priority': this.selected_priority.setValue(null); break;
            case 'selected_assignee': this.selected_assignee.setValue(null); break;
            case 'selected_location': this.selected_location.setValue(null); break;
            case 'selected_entity': this.selected_entity.setValue(null); break;
            case 'selected_vendor': this.selected_vendor.setValue(null); break;
            case 'selected_status': this.selected_status.setValue(null); break;
            case 'selected_asset': this.selected_asset.setValue(null); break;
            case 'selected_category': this.selected_category.setValue(null); break;
        }
    }

    selectedSelectBoxValue(field, event) {
        console.log("selectedSelectBoxValue", field, event);

        // handle every possible field here
        switch (field.toLowerCase()) {
            case 'selected_priority': this.selected_priority.setValue(event); break;
            case 'selected_assignee': this.selected_assignee.setValue(event); break;
            case 'selected_location': this.selected_location.setValue(event); break;
            case 'selected_entity': this.selected_entity.setValue(event); break;
            case 'selected_vendor': this.selected_vendor.setValue(event); break;
            case 'selected_status': this.selected_status.setValue(event); break;
            case 'selected_asset': this.selected_asset.setValue(event); break;
            case 'selected_category': this.selected_category.setValue(event); break;
        }
    }

    touchSelectBox(field, event) {
        console.log("touchSelectBox", field, event);
        if (!event) return;

        switch (field.toLowerCase()) {
            case 'selected_priority': this.selected_priority.markAsTouched(); break;
            case 'selected_category': this.selected_category.markAsTouched(); break;
            case 'selected_entity': this.selected_entity.markAsTouched(); break;
            case 'selected_location': this.selected_location.markAsTouched(); break;
        }
    }

    readyExpenses() {
        let _expenses = this.wo_expenses.filter(function (expense) {
            return expense.isActive;
        });

        for (var i = 0; i < _expenses.length; i++) {
            _expenses[i].referenceDate = moment(_expenses[i].referenceDate).format("YYYY-MM-DD");
        }

        return _expenses;
    }

    readyFilesData() {
        var currentActiveFiles = [];

        for (var i = 0; i < this.existingFiles.length; i++) {
            var tmpFile = this.existingFiles[i];

            if (tmpFile.isActive
                //&& !tmpFile.actualFile.type.includes("image") 
                && tmpFile.workOrderFileId == null) {
                currentActiveFiles.push({ name: tmpFile.name, notes: tmpFile.notes });
            }
        }

        return currentActiveFiles;
    }

    readyPhotosData() {
        var currentActivePhotos = [];

        for (var i = 0; i < this.existingPhotos.length; i++) {
            var tmpFile = this.existingPhotos[i];

            if (tmpFile.isActive
                //&& tmpFile.actualFile.type.includes("image")
                && tmpFile.workOrderPhotoId == null) {
                currentActivePhotos.push({ name: tmpFile.name, notes: tmpFile.notes });
            }
        }

        return currentActivePhotos;
    }

    readyDeletedFilesData() {
        var deletedFiles = [];

        for (var i = 0; i < this.existingFiles.length; i++) {
            var tmpFile = this.existingFiles[i];

            if (!tmpFile.isActive
                && tmpFile.workOrderFileId != null) {
                deletedFiles.push(tmpFile.workOrderFileId);
            }
        }

        return deletedFiles;
    }

    readyDeletedPhotosData() {
        var deletedPhotos = [];

        for (var i = 0; i < this.existingPhotos.length; i++) {
            var tmpFile = this.existingPhotos[i];

            if (!tmpFile.isActive
                && tmpFile.workOrderPhotoId != null) {
                deletedPhotos.push(tmpFile.workOrderPhotoId);
            }
        }

        return deletedPhotos;
    }

    readyDeletedExpenses() {
        var deletedExpenses = [];

        for (var i = 0; i < this.wo_expenses.length; i++) {
            var tmpExpense = this.wo_expenses[i];

            if (!tmpExpense.isActive
                && tmpExpense.workOrderExpenseId != null) {
                deletedExpenses.push(tmpExpense.workOrderExpenseId);
            }
        }

        return deletedExpenses;
    }

    validateSelectedCategory(input: FormControl) {
        console.log("validateSelectedCategory", input, this.actionType);
        if (this.actionType.workflowActionId == WorkflowActions.CREATE
            || this.actionType.workflowActionId == WorkflowActions.EDIT) {
            if (input.value == null || input.value == "" || input.value.id == null) {
                return { required: true };
            }
        }

        return null;
    }

    validateSelectedPriority(input: FormControl) {
        console.log("validateSelectedPriority", input, this.actionType);
        if (this.actionType.workflowActionId == WorkflowActions.CREATE
            || this.actionType.workflowActionId == WorkflowActions.EDIT) {
            if (input.value == null || input.value == "" || input.value.id == null) {
                return { required: true };
            }
        }

        return null;
    }

    validateStartDueDate(input: FormControl) {
        console.log("validateStartEndDate", this.selected_startdate, this.selected_duedate);
        if (this.selected_startdate != null && this.selected_duedate != null
            && this.selected_startdate.value != null && this.selected_startdate.value != ""
            && this.selected_duedate.value != null && this.selected_duedate.value != "") {
            let startDate = moment(this.selected_startdate.value).format("YYYY-MM-DD");
            let dueDate = moment(this.selected_duedate.value).format("YYYY-MM-DD");

            if (startDate > dueDate) return { crossdate: true };
        }

        return null;
    }

    validateSolution(input: FormControl) {
        console.log("validateSolution", this.actionType.workflowActionId, WorkflowActions.CLOSE_FOR_CONFIRMATION, this.solution);
        if (this.actionType.workflowActionId == WorkflowActions.CLOSE_FOR_CONFIRMATION
            && (this.solution == null
                || this.solution.value == null
                || this.solution.value == "")) {
            return { required: true };
        }

        return null;
    }

    isExpensesFormValid() {
        //console.log("validateExpenses", this.wo_expenses);

        if (this.wo_expenses != null) {
            for (var i = 0; i < this.wo_expenses.length; i++) {
                let tmpExpense = this.wo_expenses[i];
                if (tmpExpense.isActive) {
                    if (tmpExpense.expenseTypeId == null) {
                        return false;
                    } else {
                        if (tmpExpense.amount == null || tmpExpense.amount == "") {
                            return false;
                        } else {
                            let amountControl = new FormControl();
                            amountControl.setValue(tmpExpense.amount);
                            if (CustomValidators.numberOnly(amountControl) != null) {
                                return false;
                            }
                        }
                    }
                }
            }
        }

        return true;
    }

    isFilesFormValid() {
        //console.log("validateFiles", this.existingFiles, this.existingPhotos);

        if (this.existingFiles != null) {
            for (var i = 0; i < this.existingFiles.length; i++) {
                if (this.existingFiles[i].isActive && this.existingFiles[i].workOrderFileId == null) {
                    if (this.existingFiles[i].notes == "") {
                        return false;
                    }
                }
            }
        }

        if (this.existingPhotos != null) {
            for (var i = 0; i < this.existingPhotos.length; i++) {
                if (this.existingPhotos[i].isActive && this.existingPhotos[i].workOrderPhotoId == null) {
                    if (this.existingPhotos[i].notes == "") {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    onChangesFiles() {
        console.log("changes on notes files detected");
        if (this._workOrderFilesComponent.validateFiles() && this._workOrderFilesComponent.validatePhotos()) {
            this._filesTab.headerStyleClass = '';
        }
    }

    onChangesExpenses() {
        if (this._workOrderExpensesComponent.validateExpenses()) {
            this._expensesTab.headerStyleClass = '';
        }
    }

    markAsTouchedAll() {
        Object.keys(this.formGroupAdd.controls).forEach(key => {
            this.formGroupAdd.controls[key].markAsTouched();
        });
    }
}