import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions } from 'ng2-datepicker';

import { TaskService } from '../task.service';
import { LocationService } from '../../../services/location.service';
import { AssetService } from '../../../services/asset.service';
import { UsersService } from '../../users/users.service';

import { WorkflowActions, WorkOrderStatuses } from '../../../global.state';

@Component({
    selector: 'form-single-request',
    templateUrl: './singlerequest.component.html',
    providers: [LocationService, AssetService, UsersService]
})
export class SingleRequestComponent {
    public selectedWoType: { id, label };
    public actionType: { workflowActionId, name }; // JSON of Action
    public selectedWO;

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
    public selected_status;
    public selected_priority;
    public selected_assignee;
    public contact_person;
    public contact_number;
    public solution;

    public selected_startdate;
    public selected_starttime;
    public selected_duedate;

    public existingFiles;
    public existingPhotos;

    public items_assets: any = [];
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
        selected_status: "disabled"

    }

    public defSaveButtonPermissions = {
        default: "show",
        action: {
            "0" : "hide"
        }
    }

    constructor(
        public fb: FormBuilder,
        public cdr: ChangeDetectorRef,
        private _taskService: TaskService,
        private _locationService: LocationService,
        private _assetService: AssetService,
        private _userService: UsersService
    ){
    
    }

    ngOnInit() {
        this.formGroupAdd = this.fb.group({
            'wo_number': ['', null],
            'task_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'task_desc': ['', null],
            'selected_category': ['', null],
            'selected_location': ['', null],
            'location_info': ['', null],
            'selected_status': ['', null],
            'selected_priority': ['', null],
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
        this.location_info = this.formGroupAdd.controls['location_info'];
        this.selected_status = this.formGroupAdd.controls['selected_status'];
        this.selected_priority = this.formGroupAdd.controls['selected_priority'];
        this.contact_person = this.formGroupAdd.controls['contact_person'];
        this.contact_number = this.formGroupAdd.controls['contact_number'];
        this.solution = this.formGroupAdd.controls['solution'];

        this.selected_startdate = this.formGroupAdd.controls['selected_startdate'];
        this.selected_starttime = this.formGroupAdd.controls['selected_starttime'];
        this.selected_duedate = this.formGroupAdd.controls['selected_duedate'];

        if (this.selectedWO != null) {
            // reload WO Data
            this._taskService.getMyTaskById(this.selectedWO.workOrderId).subscribe((response) => {
                console.log("work-order/get response", response.data);
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

                    //"selected_startdate": new Date(this.selectedWO.startDate),
                    //"selected_duedate": new Date(this.selectedWO.dueDate)
                });

                this.selected_startdate.setValue(new Date(this.selectedWO.startDate));
            });

            // 0: View
            // 7: In Progress
            // 4: Assign/Reassign
            // 5: Cancel
            // 6: Pending
            if (this.actionType.workflowActionId == WorkflowActions.VIEW) {
                this.formGroupAdd.disable();
                this.disabled = true;
                this._defFieldPermissions.selected_assignee = "disabled";

            } else if (this.actionType.workflowActionId == WorkflowActions.ASSIGN_REASSIGN) {
                // do not use FormGroup.disable() because FormGroup.valid will always FALSE
                //this.formGroupAdd.disable();
                this.disabled = true;

                this.wo_number.disable();
                this.task_name.disable();
                this.task_desc.disable();
                this.selected_category.disable();
                this.selected_location.disable();
                this.location_info.disable();
                this.selected_status.disable();
                this.selected_priority.disable();
                this.contact_person.disable();
                this.contact_number.disable();

                this._defFieldPermissions.selected_assignee = "show";
                this._defFieldPermissions.selected_startdate = "show";
                this._defFieldPermissions.selected_starttime = "show";
                this._defFieldPermissions.selected_duedate = "show";

            } else if (this.actionType.workflowActionId == WorkflowActions.CANCEL
                || this.actionType.workflowActionId == WorkflowActions.PENDING
                || this.actionType.workflowActionId == WorkflowActions.IN_PROGRESS) {
                // disable all
                this.disabled = true;

                this.wo_number.disable();
                this.task_name.disable();
                this.task_desc.disable();
                this.selected_category.disable();
                this.selected_location.disable();
                this.location_info.disable();
                this.selected_status.disable();
                this.selected_priority.disable();
                this.contact_person.disable();
                this.contact_number.disable();

                this._defFieldPermissions.selected_assignee = "disabled";
                this._defFieldPermissions.selected_startdate = "disabled";
                this._defFieldPermissions.selected_starttime = "disabled";
                this._defFieldPermissions.selected_duedate = "disabled";

            } else {
                this.wo_number.disable();
                this._defFieldPermissions.selected_assignee = "disabled";
                this._defFieldPermissions.selected_status = "disabled";

                // filter by status
                //if (this.selectedWO.currentStatusId == )
            }
        }

        this._locationService.getLocations().subscribe((locations) => {
            console.log("location response", locations);
            var lstLocations = locations.data;
            this.items_locations = [];
            for (var i = 0; i < lstLocations.length; i++) {
                this.items_locations.push({ text: lstLocations[i].name, id: lstLocations[i].locationId });
            }
            console.log("items_locations", this.items_locations);
        });

        // load entities
        

        // load all assets
        this._assetService.getAssets().subscribe((assets) => {
            var lstAssets = assets.data;

            this.items_assets = [];
            for (var i = 0; i < lstAssets.length; i++) {
                this.items_assets.push({ text: lstAssets[i].fullname, id: lstAssets[i].userId });
            }
        });

        // load all users as assignee
        this._userService.getUsers().subscribe((users) => {
            var lstUsers = users.data;
            console.log(lstUsers);

            // clear assignee list
            this.items_assignees = [];
            for (var i = 0; i < lstUsers.length; i++) {
                this.items_assignees.push({ text: lstUsers[i].fullname, id: lstUsers[i].userId });
            }
        });
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
            case 'selected_priority': this.selected_priority = event.id; break;
            case 'selected_assignee': this.selected_assignee = event.id; break;
            case 'selected_location': this.selected_location = event.id; break;
            case 'selected_status': this.selected_status = event.id; break;
            case 'selected_asset': this.selected_asset = event.id; break;
            case 'selected_category': this.selected_category = event.id; break;
        }
    }

    // btn cancel
    onCancel() {
        console.log("cancel");
        this._taskService.announceEvent("addNewModal_btnCancelOnClick");
    }
}