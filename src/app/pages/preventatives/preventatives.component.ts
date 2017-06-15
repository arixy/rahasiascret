import { Component, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ModalDirective } from 'ng2-bootstrap';
import { Observable } from 'rxjs/Observable';
import { FormGroup, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import { DataTable, TabViewModule } from "primeng/primeng";
import { AssetService } from '../../services/asset.service';
import { LocationService } from '../../services/location.service';
import { WorkOrderService } from '../../services/work-order.service';
import { MaintenanceService } from './maintenance.service';
import { TaskService } from './../task/task.service';

import { ExpensesComponent } from './component/expenses/expenses.component';

@Component({
  selector: 'preventatives',
  styleUrls: ['./modals.scss', './tablestyle.scss', './purple-green.scss'],
  templateUrl: 'preventatives.html',
  encapsulation: ViewEncapsulation.None
})
export class Preventatives {

    // Date
    date: DateModel;
    options: DatePickerOptions;
    
    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
    @ViewChild('completeJobModal') completeJobModal: ModalDirective;
    public work_order_categories;
    public work_order_categories$: Observable<any>;
    public locations;
    public locations$: Observable<any>;
    public assets;
    public assets$: Observable<any>;
    public maintenances;
    public maintenances$: Observable<any>;
    
    private myTasks : any;
    private totalRecords;

    readonly PREVENTIVE_REQUEST = 1;
    readonly RECURRING_REQUEST = 2;
    readonly SINGLE_TIME_REQUEST = 3;
    readonly TENANT_REQUEST = 4;
    readonly GUEST_REQUEST = 5;
    readonly OWNER_REQUEST = 6;

    // wo type list
    private woTypes;

    // selected wo type
    public selectedWoType: {id, label};

    // static
    private readonly DEFAULT_ITEM_PER_PAGE : number = 10;
    private readonly DEFAULT_SORT_FIELD : string = "dateUpdated";

    
    // Variables for Maintenance Order
    public task;
    public wo_number;
    public description;
    public wo_category_id;
    public location_id;
    public asset_id;
    public due_after;
    public start_date;
    public every;
    
    public wo_edit;
    public edit_task;
    public edit_wo_number;
    public edit_description;
    public edit_wo_category_id;
    public edit_location_id;
    public edit_asset_id;
    public edit_due_after;
    public edit_start_date;
    public edit_every;
    public initial_wo_number;
    
    public complete_remarks_fc = new FormControl();
    public complete_remarks;
    
    // Select Box Items
    public items_wocategory = null;
    public items_location = null;
    public items_asset = null;
    public items_repeat = ['Daily', 'Weekly', 'Monthly', 'Yearly', 'Every'];
    public items_period = ['day(s)', 'week(s)', 'month(s)','year(s)'];
    public items_priority = ['High', 'Medium', 'Low'];
    public selected_period = null;
    public selected_repeat = null;
    public selected_priority = null;
    public selected_due_period = null;
    public selected_wo_category = null;
    public selected_location = null;
    public selected_asset = null;

    // Date Item
    public selected_start_date = null;

    public form;
    public editForm;
    
    public checked_status = false; 

    public show_new_complete = true;
    public submitted;
    public table_settings = {
        mode: 'external',
        add: {
          addButtonContent: '<i class="ion-ios-plus-outline"></i>',
          createButtonContent: '<i class="ion-checkmark"></i>',
          cancelButtonContent: '<i class="ion-close"></i>',
        },
        edit: {
          editButtonContent: '<i class="ion-edit"></i>',
          saveButtonContent: '<i class="ion-checkmark"></i>',
          cancelButtonContent: '<i class="ion-close"></i>',
        },
        delete: {
          deleteButtonContent: '<i class="ion-trash-a"></i>',
          confirmDelete: true
        },
        columns: {
          priority: {
            title: 'Priority',
            type: 'string'
          },
          task: {
              title: 'Task',
              type: 'string'
          },
          start_date: {
              title: 'Start',
              type: 'string'
          },
          location_name: {
              title: 'Location',
              type: 'string'
          },
          status: {
              title: 'Status',
              type: 'string'
          }
        }
      };

  @Input() public source: LocalDataSource = new LocalDataSource();

  // MISCELLANEOUS
  public repeat_every = false;
     
  constructor(
    public woService: WorkOrderService,
    public assetService: AssetService,
    public locationService: LocationService,
    public maintenanceService: MaintenanceService,
    private _taskService: TaskService,
    public fb: FormBuilder
  ) {
      
      // hardcoded wo type list
      this.woTypes = [{ id: 1, label: "Preventive Maintenance"},
                        {id: 2, label: "Recurring Request"},
                        {id: 3, label: "Single Request"},
                        {id: 4, label: "Tenant Request"},
                        {id: 5, label: "Guest Request"},
                        {id: 6, label: "Owner Request"},
                       ];
      // DATA MAPPING
      
      this.initial_wo_number = Math.floor(Math.random() * 100) + 1;
      this.maintenances$ = maintenanceService.getMaintenances();
      this.maintenances$.subscribe(
        (data) => {
            this.maintenances = data;
            console.log('Maintenances Data:', this.maintenances);
            this.source.load(this.maintenances);
        }
      );
      
      this.work_order_categories$ = woService.getWOs();
      this.work_order_categories$.subscribe(
        (data) => {
            this.work_order_categories = data.data;
            this.items_wocategory = this.work_order_categories.map(
                (wo_category_object) => {
                    return Object.assign({}, {
                        id: wo_category_object.id,
                        text: wo_category_object.name
                    });
                }
              );
        }
      );
      
      
      this.locations$ = locationService.getLocations();
      this.locations$.subscribe(
        (data) => {
            this.locations = data.data;
            this.items_location = this.locations.map(
                (location) => {
                    return Object.assign({}, {
                       id: location.id,
                        text: location.name
                    });
                }
              );
        }
      );
      
      
      // NOTE Assets has problem from API
    assetService.getAssets().subscribe(
        (data) => {
            this.assets = data.data;
            this.items_asset = this.assets.map(
                (asset) => {
                    return Object.assign({}, {
                        id: asset.id,
                        text: asset.name
                    })
                }
              );
        }
    );
      
      
      
      // FORM CONTROLS MAPPING
      this.form = fb.group({
          'task': ['', Validators.required],
          'wo_number': [''],
          'description': ['', Validators.required],
          'due_after': [''],
          'start_date': [''],
          'every': ['']
    });
      
    this.editForm = fb.group({
          'edit_task': ['', Validators.required],
          'edit_wo_number': [''],
          'edit_description': ['', Validators.required],
          'edit_due_after': [''],
          'edit_start_date': [''],
          'edit_every': [''] 
    });

      this.task = this.form.controls['task'];
      this.wo_number = this.form.controls['wo_number']
      this.description = this.form.controls['description'];
      this.due_after = this.form.controls['due_after'];
      this.start_date = this.form.controls['start_date'];
      this.every = this.form.controls['every'];
      
      this.edit_task = this.editForm.controls['edit_task'];
      this.edit_wo_number = this.editForm.controls['edit_wo_number']
      this.edit_description = this.editForm.controls['edit_description'];
      this.edit_due_after = this.editForm.controls['edit_due_after'];
      this.edit_start_date = this.editForm.controls['edit_start_date'];
      this.edit_every = this.editForm.controls['edit_every'];
      
      // NOTE: The rest is through manual select box
      
      
      this.options = new DatePickerOptions();
      
      // Just to simulate flow in DEMO:
      
    this.show_new_complete = true;
    /*if(localStorage.getItem('logged_user') != 'userb@gmail.com'){
          // Hide some Buttons
          this.show_new_complete = false;
      } else {  */
      
      this.complete_remarks_fc.valueChanges.debounceTime(300).subscribe(
            (remarks) => {
                console.log('remarks:', remarks);
                this.complete_remarks = remarks;
            }
       );
  }
     
     public addNewPreventative(){
         
         this.form.patchValue({ wo_number: this.initial_wo_number });
         this.addNewModal.show();
         
     }

     
    public deletePreventative(event){
        console.log('Deleting..');
        console.log(event.id);
        // Delete using Service
        this.maintenances = this.maintenanceService.deleteMaintenance(event.id);
        console.log(this.maintenances);
        this.source.load(this.maintenances);
    }
    public editPreventative(event){
        console.log('Editing', event);
        
        // Inject Data of the Edited into the modal first
        this.wo_edit = event;
        this.editModal.show();
        
        // Inject Initial Value to the Edit Form
        this.editForm.patchValue({ edit_task: this.wo_edit.task });
        this.editForm.patchValue({ edit_description: this.wo_edit.description });
        this.editForm.patchValue({ edit_due_after: this.wo_edit.due_after});
        
        if(this.wo_edit.status == 'New'){
            this.checked_status = false;
        } else {
            this.checked_status = true;
        }
    }
    public startDate(data){
        if(data.type == 'dateChanged'){
            this.selected_start_date = data.data.formatted;
        }
        console.log('Date Object:', this.date);
        console.log('Data Passed:', data);
    }

    // SELECT BOXES LOGIC
    public selectedRepeat(event){
        console.log('Repeat Selected:', event);
        if(event.text =='Every'){
            this.repeat_every = true;
        } else {
            this.repeat_every = false;
        }
        this.selected_repeat = event.text;
    }

    public selectedPeriod(event){
        console.log('Period Selected:', event);
        this.selected_period = event.text;
    }
    
    public selectedDuePeriod(event){
        this.selected_due_period = event.text;
    }

    public selectedPriority(event){
        this.selected_priority = event.text;
    } 
    
    public selectedWOCategory(event){
        this.selected_wo_category = event;
        console.log('Select WO Category', this.selected_wo_category);
    }

    public selectedLocation(event){
        this.selected_location = event;
    }

    public selectedAsset(event){
        this.selected_asset = event;
    }

    public slideToggleChange(event){
        console.log('slidetoggle', event.checked);
        
        // Directly change the project status to completed. TRUE => Completed. FALSE => New
        this.maintenanceService.changeStatus(this.wo_edit.id, event.checked);
        if(event.checked == true){
            this.completeJobModal.show();
        }
        
        this.maintenances = this.maintenanceService.getMaintenancesNormal();
        this.source.load(this.maintenances);
    }
    public submitJobRemarks(){
        // TODO: Add Remarks to Model
        this.completeJobModal.hide();
    }
    public closeJobRemarks(){
        this.completeJobModal.hide();
    }

    public onSubmit(values):void {
        this.submitted = true;
        if (this.form.valid) {
            console.log('Form Values:', values);
            var formatted_object = Object.assign({}, {
                task: values.task,
                wo_number: values.wo_number,
                description: values.description,
                wo_category_id: this.selected_wo_category.id,
                location_id: this.selected_location.id,
                asset_id: this.selected_asset.id,
                priority: this.selected_priority,
                due_period: this.selected_due_period,
                due_after: values.due_after,
                start_date: this.selected_start_date,
                repeat: this.selected_repeat,
                every: values.every,
                period: this.selected_period
            });
            console.log('Formatted Object:', formatted_object);
          // your code goes here
            let response = this.maintenanceService.addMaintenance(formatted_object);

            console.log(response);
            // Refresh the Table

            this.addNewModal.hide();

        }
    }

    public onEditSubmit(values):void {
        console.log('Edit values', values);
        this.editModal.hide();
    }

    // Utilities
    public hideChildModal(){
         this.addNewModal.hide();
     }
    public hideEditModal(){
        this.editModal.hide();
    }
    
    refresh($event, table){
        console.log("customRefresh");
        console.log($event);
        console.log(table);

        this.getAllMyTasks(this.buildFilter(table));
    }

    resetFilters(table : DataTable){
        console.log("resetFilters");
        console.log(table);

        table.filters = {};
        table.globalFilter = "";

        this.getAllMyTasks(this.buildFilter(table));
    }


    private buildFilter(table : DataTable){
        if(table == null){
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
        else{
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

    private getAllMyTasks(filters){
        this._taskService.getAllMyTasks(filters).subscribe(
            (response)=>{
                console.log("Response Data");
                console.log(response);

                this.myTasks = response.data;

                for(var i = 0; i < this.myTasks.length; i++){
                    if (this.myTasks[i].actions == null) {
                        this.myTasks[i].actions = [];
                    }

                    this.myTasks[i].actions.unshift({ workflowActionId: -2, name: "View" });
                    //this.myTasks[i].actions.push({ workflowActionId: 4, name: "Assign/Reassign" });
                    this.myTasks[i].dateUpdated = new Date(this.myTasks[i].dateUpdated);
                }

                if(response.paging != null)
                    this.totalRecords = response.paging.total;
                else
                    this.totalRecords = 0;
            }
        );
    }
}
