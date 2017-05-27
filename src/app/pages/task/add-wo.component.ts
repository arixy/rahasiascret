import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';

import { TaskService } from './task.service';
import { LocationService } from '../../services/location.service';
import { UsersService } from '../users/users.service';

@Component({
    selector: 'add-wo',
    templateUrl: 'add-wo.component.html',
    styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
    providers: [LocationService, UsersService],
    encapsulation: ViewEncapsulation.None,
})
export class AddNewWorkOrderComponent{
     public selectedWoType: { id, label };
     public actionType: { id, label }; // JSON of Action

     readonly PREVENTIVE_REQUEST = 1;
     readonly RECURRING_REQUEST = 2; 
     readonly SINGLE_TIME_REQUEST = 3;
     readonly TENANT_REQUEST = 4;
     readonly GUEST_REQUEST = 5;
     readonly OWNER_REQUEST = 6;

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
     public selected_duedate;
     public selected_priority;
     public selected_assignee;
     public selected_entity;
     public contact_person;
     public contact_number;
     private pending_hours;

     // Recurring Tab
     public selected_repeat;
     public selected_repeat_period;
     public selected_startdate;
     public selected_starttime;
     public selected_dueperiod;
     public due_after;
     public repeat_every;
     
     public items_categories: any = [{ text: 'Complaints', id: 1}];
     public items_locations: any = [{ text: 'Lantai 3', id: 1 }, { text: 'Lantai 5', id: 2 }];
     public items_repeats: any = [
         { text: 'Daily', id: 1 },
         { text: 'Weekly', id: 2 },
         { text: 'Monthly', id: 3 },
         { text: 'Yearly', id: 4 },
         { text: 'One-Time', id: 5 },
         { text: 'Every', id: 6 },
     ];
     public items_priorities: any = [{ text: 'High', id: 1 }];
     public items_entities: any = [{ text: 'Obrol', id: 1}];
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
     public items_period_duration: any = [{ text: 'day(s)', id: 1 }, { text: 'week(s)', id: 2 }, { text: 'month(s)', id: 3 }, { text: 'year(s)', id: 4 }];

    // error message container
     public error_msg = {
         category: null,
         location: null,
     };
     
     constructor(
        public fb: FormBuilder,
        public cdr: ChangeDetectorRef,
        private _locationService: LocationService,
        private _taskService: TaskService,
        private _userService: UsersService
     ){
        
     }
     
     ngOnInit(){
         console.log("oninit");

         // define Add New Form Group
         // If Preventive Maintenance is selected
         //if (this.selectedWoType.id == 1) {
         // temporarily declare all field including select field
             this.formGroupAdd = this.fb.group({
                 'task_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
                 'task_desc': ['', null],
                 'selected_category': ['', null],
                 'selected_location': ['', null],
                 'location_info': ['', null],
                 'selected_status': ['', null],
                 'selected_duedate': ['', null],
                 'selected_priority': ['', null],
                 'contact_number': ['', null],
                 'contact_person': ['', null],

                 'selected_repeat': ['', null],
                 'selected_startdate': ['', null],
                 'selected_starttime': ['',null],
                 'selected_dueperiod': ['', null],
                 'due_after': ['', null],
                 'repeat_every': ['', null] // repeat every
             });
             this.task_name = this.formGroupAdd.controls['task_name'];
             this.task_desc = this.formGroupAdd.controls['task_desc'];
             this.selected_category = this.formGroupAdd.controls['selected_category'];
             this.selected_location = this.formGroupAdd.controls['selected_location'];
             this.location_info = this.formGroupAdd.controls['location_info'];
             this.selected_status = this.formGroupAdd.controls['selected_status'];
             this.selected_duedate = this.formGroupAdd.controls['selected_duedate'];
             this.selected_priority = this.formGroupAdd.controls['selected_priority'];
             this.contact_person = this.formGroupAdd.controls['contact_person'];
             this.contact_number = this.formGroupAdd.controls['contact_number'];

             this.selected_repeat = this.formGroupAdd.controls['selected_repeat'];
             this.selected_startdate = this.formGroupAdd.controls['selected_startdate'];
             this.selected_starttime = this.formGroupAdd.controls['selected_starttime'];
             this.selected_dueperiod = this.formGroupAdd.controls['selected_dueperiod'];
             this.due_after = this.formGroupAdd.controls['due_after'];
             this.repeat_every = this.formGroupAdd.controls['repeat_every'];
         //}

         this._locationService.getLocations().subscribe((locations) => {
             // TODO: Uncomment later
             //this.items_locations = locations.data;
         });

         // load entities based on selected wo type
         if (this.selectedWoType.id == this.PREVENTIVE_REQUEST) {
             
         }

         // load all users as assignee
         this._userService.getUsers().subscribe((users) => {
             var lstUsers = users.data;
             console.log(lstUsers);

             // clear assignee list
             this.items_assignees = [];
             for (var i = 0; i < lstUsers.length; i++) {
                 this.items_assignees.push({text: lstUsers[i].fullname, id: lstUsers[i].userId});
             }

             //this.items_assignees.clear();

             //for (var singleUser: any in lstUsers) {
             //    this.items_assignees.push({ text: singleUser.fullname, id: singleUser.userId });
             //}
         });
     }
     
     ngAfterViewInit(){
         
     }
     
     // btn submit
     onSubmit(formValue) {
         console.log("onSubmit", formValue, this.selected_repeat);

         if (this.formGroupAdd.valid) {
             console.log("valid");

             // handle manual validation

             // manual validation VALID
             var formatted_object = Object.assign({}, {
                 woNumber: "TEST-01" + Date.now().toLocaleString(),
                 woTypeId: this.selectedWoType.id,
                 taskName: this.task_name.value,
                 description: this.task_desc.value,
                 woCategoryId: this.selected_category,
                 woPriorityId: this.selected_priority,
                 entityId: this.selected_entity,
                 locationId: this.selected_location,
                 locationInfo: this.location_info.value,
                 assetId: this.selected_asset,
                 currentStatusId: this.selected_status,
                 currentAssigneeId: this.selected_assignee,
                 mainPicId: this.selected_assignee,
                 // TODO: need to change to UTC+0 first
                 startDate: this.selected_startdate.value,
                 repeatOptionId: this.selected_repeat,
                 every: this.repeat_every.value,
                 everyPeriodId: this.selected_repeat_period,
                 dueAfter: this.due_after.value,
                 duePeriodId: this.selected_dueperiod,
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
                 solution: null
             });

             console.log("To Send", formatted_object);
         }

         return false;
     }
     
     // btn cancel
     onCancel(){
         console.log("cancel");
         this._taskService.announceEvent("addNewModal_btnCancelOnClick");
     }
     
     //// selected location
     //selectedLocation(event){
     //    console.log(event);
         
     //    this.selected_location = event.text;
     //}
     
     //removedLocation(event){
     //    console.log(event);
         
     //    this.selected_location = '';
     //}

     //// selected category
     //selectedCategory(event) {
     //    console.log("selectedCategory")
     //    console.log(event);

     //    this.selected_category = event.id;
     //}

     //removedCategory(event) {
     //    console.log(event);

     //    this.selected_category = '';
     //}

     // selected due date
     selectedDuedate(event) {
         console.log("selectedDuedate", event);
     }

     selectedStartDate(event) {
         console.log("selectedStartDate", event);
     }

     selectedStartTime(event) {
         console.log("selectedStartTime", event);
     }

     validateSelectedCategory(): ValidatorFn {
         return (control: AbstractControl): { [key: string]: any } => {
             console.log("customValidator");
             console.log(control)

             if (control.value == null || control.value == "") {
                 return { selected_duedate: true };
             }
             return null;
         }
     }

     // global selected event?
     removeSelectBoxValue(field: string, event) {
         console.log("removeSelecBoxValue", field, event);

         // handle every possible field here
         switch (field.toLowerCase()) {
             case 'selected_repeat': this.selected_repeat = null; break;
             case 'selected_priority': this.selected_priority = null; break;
             case 'selected_assignee': this.selected_assignee = null; break;
             case 'selected_location': this.selected_location = null; break;
             case 'selected_status': this.selected_status = null; break;
             case 'selected_entity': this.selected_entity = null; break;
             case 'selected_asset': this.selected_asset = null; break;
             case 'selected_category': this.selected_category = null; break;
             case 'selected_repeat_period': this.selected_repeat_period = null; break;
             case 'selected_dueperiod': this.selected_dueperiod = null; break;
         }
         
     }

     selectedSelectBoxValue(field, event) {
         console.log("selectedSelectBoxValue", field, event);

         // handle every possible field here
         switch (field.toLowerCase()) {
             case 'selected_repeat': this.selected_repeat = event.id; break;
             case 'selected_priority': this.selected_priority = event.id; break;
             case 'selected_assignee': this.selected_assignee = event.id; break;
             case 'selected_location': this.selected_location = event.id; break;
             case 'selected_status': this.selected_status = event.id; break;
             case 'selected_entity': this.selected_entity = event.id; break;
             case 'selected_asset': this.selected_asset = event.id; break;
             case 'selected_category': this.selected_category = event.id; break;
             case 'selected_repeat_period': this.selected_repeat_period = event.id; break;
             case 'selected_dueperiod': this.selected_dueperiod = event.id; break;
         }
     }

     validateSelectedRepeat(): ValidatorFn {
         return null;
     }
 }