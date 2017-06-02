import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';

import { TaskService } from '../task.service';
import { LocationService } from '../../../services/location.service';
import { AssetService } from '../../../services/asset.service';
import { UsersService } from '../../users/users.service';

@Component({
    selector: 'form-recurring-request',
    templateUrl: './recurringrequest.component.html',
    providers: [LocationService, AssetService, UsersService]
})
export class RecurringRequestComponent {
    public selectedWoType: { id, label };
    public actionType: { id, label }; // JSON of Action

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
    public selected_entity;
    public contact_person;
    public contact_number;

    public selected_startdate;
    public selected_starttime;
    public selected_duedate;

    // Recurring Tab
    public selected_repeat = { text: 'Daily', id: 1 };
    public repeat_every;
    public selected_repeat_repeat_period;
    public due_after;
    public selected_dueperiod;

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
    public items_repeats: any = [
        { text: 'Daily', id: 1 },
        { text: 'Weekly', id: 2 },
        { text: 'Monthly', id: 3 },
        { text: 'Yearly', id: 4 },
        { text: 'One-Time', id: 5 },
        { text: 'Every', id: 6 },
    ];
    public items_period_duration: any = [{ text: 'day(s)', id: 1 }, { text: 'week(s)', id: 2 }, { text: 'month(s)', id: 3 }, { text: 'year(s)', id: 4 }];

    // error message container
    public error_msg = {
        category: null,
        location: null,
    };

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
            'task_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'task_desc': ['', null],
            'selected_category': ['', null],
            'selected_location': ['', null],
            'location_info': ['', null],
            'selected_entity': ['', null],
            'selected_status': ['', null],
            'selected_priority': ['', null],
            'contact_person': ['', null],
            'contact_number': ['', null],
            
            'selected_startdate': ['', null],
            'selected_starttime': ['', null],
            'selected_duedate': ['', null],

            'due_after': ['', null],
            'repeat_every': ['', null]
        });
        this.task_name = this.formGroupAdd.controls['task_name'];
        this.task_desc = this.formGroupAdd.controls['task_desc'];
        this.selected_category = this.formGroupAdd.controls['selected_category'];
        this.selected_location = this.formGroupAdd.controls['selected_location'];
        this.location_info = this.formGroupAdd.controls['location_info'];
        this.selected_entity = this.formGroupAdd.controls['selected_entity'];
        this.selected_status = this.formGroupAdd.controls['selected_status'];
        this.selected_priority = this.formGroupAdd.controls['selected_priority'];
        this.contact_person = this.formGroupAdd.controls['contact_person'];
        this.contact_number = this.formGroupAdd.controls['contact_number'];

        this.selected_startdate = this.formGroupAdd.controls['selected_startdate'];
        this.selected_starttime = this.formGroupAdd.controls['selected_starttime'];
        this.selected_duedate = this.formGroupAdd.controls['selected_duedate'];

        this.due_after = this.formGroupAdd.controls['due_after'];
        this.repeat_every = this.formGroupAdd.controls['repeat_every'];

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
            case 'selected_priority': this.selected_priority = event; break;
            case 'selected_assignee': this.selected_assignee = event; break;
            case 'selected_location': this.selected_location = event; break;
            case 'selected_status': this.selected_status = event; break;
            case 'selected_entity': this.selected_entity = event; break;
            case 'selected_asset': this.selected_asset = event; break;
            case 'selected_category': this.selected_category = event; break;
            case 'selected_repeat': this.selected_repeat = event; break;
            case 'selected_repeat_repeat_period': this.selected_repeat_repeat_period = event; break;
            case 'selected_dueperiod': this.selected_dueperiod = event; break;
        }
    }

    // btn cancel
    onCancel() {
        console.log("cancel");
        this._taskService.announceEvent("addNewModal_btnCancelOnClick");
    }
}