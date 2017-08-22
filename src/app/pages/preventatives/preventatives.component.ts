import { Component, ViewChild, ViewChildren, ViewContainerRef, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, OnDestroy, Input, ViewEncapsulation, QueryList } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { ModalDirective } from 'ng2-bootstrap';
import { FormGroup, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import { DataTable, TabViewModule } from "primeng/primeng";
import { AssetService } from '../../services/asset.service';
import { LocationService } from '../../services/location.service';
import { WorkOrderService } from '../../services/work-order.service';
import { MaintenanceService } from './maintenance.service';
import { TaskService } from './../task/task.service';

import { ExpensesComponent } from './component/expenses/expenses.component';

// services related
import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import { saveAs } from 'file-saver';

// custom components
//import { AddNewWorkOrderComponent } from './add-wo.component';
import { SingleRequestComponent } from './../task/forms/singlerequest.component';
import { TenantRequestComponent } from './../task/forms/tenantrequest.component';
import { OwnerRequestComponent } from './../task/forms/ownerrequest.component';
import { GuestRequestComponent } from './../task/forms/guestrequest.component';
import { RecurringRequestComponent } from './../task/forms/recurringrequest.component';
import { PreventiveRequestComponent } from './../task/forms/preventiverequest.component';

import { GlobalState, WorkOrderStatuses, WorkflowActions } from '../../global.state';

import { ActivatedRoute, Router } from '@angular/router';

import { FilterInputComponent } from '../filter-input.component';

@Component({
  selector: 'preventatives',
  styleUrls: ['./modals.scss', './tablestyle.scss', './purple-green.scss'],
  templateUrl: 'preventatives.html',
  encapsulation: ViewEncapsulation.None,
  entryComponents: [SingleRequestComponent, 
                   TenantRequestComponent,
                   OwnerRequestComponent,
                   GuestRequestComponent,
                   RecurringRequestComponent,
                   PreventiveRequestComponent]
})
export class Preventatives {

    // Date
    date: DateModel;
    options: DatePickerOptions;
    
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
    private totalRecordsScheduled;

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

    // forms
    public formGroupAdd;
    public taskName;
    public taskDesc;
    public selectedCategory;
    public selectedProperty;
    public selectedLocation;
    public selectedStatus;
    public selectedDueDate;
    public selectedPriority;

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

    // print related
    private selPrintWOId;

    // delete
    private deleteWO;
    private errDelete;

    // loading flag
    private isLoadingWOData: boolean = true;
    private isLoadingScheduleData: boolean = true;

    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
    @ViewChild('deleteModal') deleteModal: ModalDirective;
    @ViewChild('dt') taskListsTable: DataTable;
    @ViewChild('dtschedule') scheduleListsTable: DataTable;
    //@Input() public source: LocalDataSource = new LocalDataSource();

    //@ViewChild('dynamicModalContent', {read: ViewContainerRef}) viewAddNewModal: ViewContainerRef;
    @ViewChild('dynamicModalBody', { read: ViewContainerRef }) viewModalBody: ViewContainerRef;


    // filters
    private filterMasterWO: any = {};
    private filterMasterSchedule: any = {};
    @ViewChildren('filterWO') woFilters: QueryList<FilterInputComponent>;
    @ViewChildren('filterSchedule') scheduleFilters: QueryList<FilterInputComponent>;

  @Input() public source: LocalDataSource = new LocalDataSource();

  // MISCELLANEOUS
  public repeat_every = false;

    private currentOpenModal: any;
    private modalTitle: string;
    
    private subscription: Subscription;
     
  constructor(
    public woService: WorkOrderService,
    public cdr: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    public assetService: AssetService,
    public locationService: LocationService,
    public maintenanceService: MaintenanceService,
    private _taskService: TaskService,
    public fb: FormBuilder,
    public activatedRoute: ActivatedRoute
  ) {
      this.deleteWO = {};
      
      this.subscription = this._taskService.eventEmitted$.subscribe(event => {
          console.log("event: " + event);

          // separate action between events
          if (event == "addNewModal_btnCancelOnClick") {
            this.addNewModal.hide();
          } else if (event == "addNewModal_btnSaveOnClick_createSuccess") {
              this.addNewModal.hide();
              this.getAllWOs(this.buildFilter(this.taskListsTable, this.filterMasterWO));
              this.getAllScheduledWOs(this.buildFilter(this.scheduleListsTable, this.filterMasterSchedule));
          } else if (event == "addNewModal_btnSaveOnClick_updateSuccess") {
              this.addNewModal.hide();
              this.getAllWOs(this.buildFilter(this.taskListsTable, this.filterMasterWO));
              this.getAllScheduledWOs(this.buildFilter(this.scheduleListsTable, this.filterMasterSchedule));
          }
        });
      
      // DATA MAPPING
      
      this.initial_wo_number = Math.floor(Math.random() * 100) + 1;
      /*this.maintenances$ = maintenanceService.getScheduledWOs(null);
      this.maintenances$.subscribe(
        (data) => {
            this.maintenances = data.data;
            console.log('Maintenances Data:', this.maintenances);
            this.source.load(this.maintenances);
        }
      );*/
      
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

    ngOnInit(){
        // master wo list
        let woTypesMaster = [{ id: 1, label: "Preventive Maintenance", menuId: 'PreventiveWorkOrder' },
        { id: 2, label: "Recurring Request", menuId: 'RecurringWorkOrder' },
        { id: 3, label: "Single Request", menuId: 'SingleWorkOrder' },
        { id: 4, label: "Tenant Request", menuId: 'TenantWorkOrder' },
        { id: 5, label: "Guest Request", menuId: 'GuestWorkOrder' },
        { id: 6, label: "Owner Request", menuId: 'OwnerWorkOrder' },
        ];

        // build creatable WO Type button
        this.woTypes = [];

        let sitemaps = JSON.parse(localStorage.getItem('sitemaps'));
        let authorizedSitemaps = JSON.parse(localStorage.getItem('authorizedSitemaps'));
        for (let master of woTypesMaster) {
            if (authorizedSitemaps[master.menuId] != null && authorizedSitemaps[master.menuId].allowAccessOrView) {
                let sitemap = sitemaps[master.menuId];
                this.woTypes.push({ id: master.id, label: sitemap.name });
            }
        }
    }
     
    ngAfterViewInit(){
        // See if there is any parameter
        //let request_type = this.activatedRoute.snapshot.params['request_type'];
        
        this.activatedRoute.params.subscribe(
            (params) => {
                let request_type = params['request_type'];
        if(request_type){
            // Open Particular Modal Based on Selected Type
            if(request_type == 'single'){
                console.log('Single!!');
                this.createNewWorkOrder({
                    id: 3, label: 'Single Request'
                });
            } else if(request_type == 'recurring'){
                console.log('Recurring!');
                this.createNewWorkOrder({
                   id: 2, label: 'Recurring Request' 
                });
            } else if(request_type == 'preventive'){
                this.createNewWorkOrder({
                    id: 1, label: 'Preventive Maintenance'   
                });
            } else if(request_type == 'tenant'){
                this.createNewWorkOrder(this.woTypes[3]);
            } else if(request_type == 'guest'){
                this.createNewWorkOrder(this.woTypes[4]);
            } else if(request_type == 'owner'){
                this.createNewWorkOrder(this.woTypes[5]);
            }
        }
            }
        );
        console.log('Activated Route', this.activatedRoute.snapshot);
    }
    createNewWorkOrder(selectedType){
        console.log(selectedType);
        this.selectedWoType = selectedType;
        
        //================================
        // START CREATE MODAL BODY
        //================================
        // clear modal body
        this.viewModalBody.clear();
        
        
        // change modal title
        this.modalTitle = "Create " + selectedType.label;

        if (this.selectedWoType.id == this.SINGLE_TIME_REQUEST) {
            this.currentOpenModal = this.createNewSingleRequestComponent(this.viewModalBody, SingleRequestComponent);
            // send specific parameters if needed
            //this.currentOpenModal.instance.variable_name = value
        } else if (this.selectedWoType.id == this.TENANT_REQUEST) {
            this.currentOpenModal = this.createNewTenantRequestComponent(this.viewModalBody, TenantRequestComponent);
        } else if (this.selectedWoType.id == this.GUEST_REQUEST) {
            this.currentOpenModal = this.createNewGuestRequestComponent(this.viewModalBody, GuestRequestComponent);
        } else if (this.selectedWoType.id == this.OWNER_REQUEST) {
            this.currentOpenModal = this.createNewOwnerRequestComponent(this.viewModalBody, OwnerRequestComponent);
        } else if (this.selectedWoType.id == this.RECURRING_REQUEST) {
            this.currentOpenModal = this.createNewRecurringRequestComponent(this.viewModalBody, RecurringRequestComponent);
        } else if (this.selectedWoType.id == this.PREVENTIVE_REQUEST) {
            this.currentOpenModal = this.createNewPreventiveRequestComponent(this.viewModalBody, PreventiveRequestComponent);
        }
        
        this.currentOpenModal.instance.selectedWoType = selectedType;
        this.currentOpenModal.instance.actionType = { workflowActionId: -1, name: "Create" };


        this.addNewModal.show();
        console.log(this.addNewModal);
    }

    // Dynamic Form Components
    createNewSingleRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService): SingleRequestComponent }): ComponentRef<SingleRequestComponent>{
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);
        
        // create actual component
        let modalContentRef = view.createComponent(addNewContent);
        
        return modalContentRef;
    }

    createNewTenantRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService): TenantRequestComponent }): ComponentRef<TenantRequestComponent> {
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(addNewContent);

        return modalContentRef;
    }

    createNewOwnerRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService): OwnerRequestComponent }): ComponentRef<OwnerRequestComponent> {
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(addNewContent);

        return modalContentRef;
    }

    createNewGuestRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService): GuestRequestComponent }): ComponentRef<GuestRequestComponent> {
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(addNewContent);

        return modalContentRef;
    }

    createNewRecurringRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService, _periodService): RecurringRequestComponent }): ComponentRef<RecurringRequestComponent> {
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(addNewContent);

        return modalContentRef;
    }

    createNewPreventiveRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService, _periodService): PreventiveRequestComponent }): ComponentRef<PreventiveRequestComponent> {
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(addNewContent);

        return modalContentRef;
    }
    doAction(modelData, selectedAction){
        console.log("doAction", modelData, selectedAction);

        this.selPrintWOId = modelData.workOrderId;
        this.cdr.detectChanges();

        if (selectedAction.workflowActionId == WorkflowActions.PRINT) {
            this._taskService.announceEvent("printWO");
            return;
        } else if (selectedAction.workflowActionId == WorkflowActions.DELETE) {
            this.deleteWO = modelData;
            this.deleteModal.show();
            return;
        }

        this.viewModalBody.clear();
        if (modelData.woTypeId == this.SINGLE_TIME_REQUEST) {
            this.currentOpenModal = this.createNewSingleRequestComponent(this.viewModalBody, SingleRequestComponent);
            //this.modalTitle = "Work Order - Single Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypes[2];
        } else if (modelData.woTypeId == this.GUEST_REQUEST) {
            this.currentOpenModal = this.createNewGuestRequestComponent(this.viewModalBody, GuestRequestComponent);
            //this.modalTitle = "Work Order - Guest Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypes[2];
        } else if (modelData.woTypeId == this.TENANT_REQUEST) {
            this.currentOpenModal = this.createNewTenantRequestComponent(this.viewModalBody, TenantRequestComponent);
            //this.modalTitle = "Work Order - Tenant Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypes[2];
        } else if (modelData.woTypeId == this.OWNER_REQUEST) {
            this.currentOpenModal = this.createNewOwnerRequestComponent(this.viewModalBody, OwnerRequestComponent);
            //this.modalTitle = "Work Order - Owner Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypes[2];
        } else if (modelData.woTypeId == this.RECURRING_REQUEST) {
            this.currentOpenModal = this.createNewRecurringRequestComponent(this.viewModalBody, RecurringRequestComponent);
            //this.modalTitle = "Work Order - Recurring Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypes[1];
        } else if (modelData.woTypeId == this.PREVENTIVE_REQUEST) {
            this.currentOpenModal = this.createNewPreventiveRequestComponent(this.viewModalBody, PreventiveRequestComponent);
            //this.modalTitle = "Work Order - Preventative Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypes[1];
        }
        // set modal title
        if(selectedAction.workflowActionId == WorkflowActions.IN_PROGRESS){
            this.modalTitle = "Set " + selectedAction.name + " ";
        }else{
            this.modalTitle = selectedAction.name + " ";
        }
        for(var i=0; i < this.woTypes.length; i++){
            if (this.woTypes[i].id == modelData.woTypeId){
                this.modalTitle += this.woTypes[i].label;
                break;
            }
        }
        // end set modal title
        
        this.currentOpenModal.instance.actionType = selectedAction;
        this.currentOpenModal.instance.selectedWO = modelData;
        this.addNewModal.show();
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

    public selectPriority(event){
        this.selected_priority = event.text;
    } 
    
    public selectedWOCategory(event){
        this.selected_wo_category = event;
        console.log('Select WO Category', this.selected_wo_category);
    }

    public selectLocation(event){
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

        this.getAllWOs(this.buildFilter(table, this.filterMasterWO));
    }

    refreshScheduled($event, table) {
        this.getAllScheduledWOs(this.buildFilter(table, this.filterMasterSchedule));
    }

    resetFilters(table : DataTable){
        console.log("resetFilters");
        console.log(table);

        this.woFilters.forEach(item => {
            item.resetFilter();
        });

        //table.filters = {};
        //table.globalFilter = "";

        this.filterMasterWO = {};

        this.getAllWOs(this.buildFilter(table, this.filterMasterWO));
    }

    resetFiltersScheduled(table: DataTable) {
        console.log("resetFilters");
        console.log(table);

        this.scheduleFilters.forEach(item => {
            item.resetFilter();
        });

        //table.filters = {};
        //table.globalFilter = "";

        this.filterMasterSchedule = {};

        this.getAllScheduledWOs(this.buildFilter(table, this.filterMasterSchedule));
    }


    private buildFilter(table: DataTable, filterMaster: any) {
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
                //"filters": table.filters,
                "filters": filterMaster,
                "first": table.first,
                "rows": table.rows,
                "globalFilter": table.globalFilter,
                "multiSortMeta": table.multiSortMeta,
                "sortField": table.sortField,
                "sortOrder": table.sortOrder
            };
        }
    }

    private getAllWOs(filters) {
        this.isLoadingWOData = true;
        this.maintenanceService.getAllWOs(filters).subscribe(
            (response)=>{
                console.log("Response Data");
                console.log(response);

                this.myTasks = response.data;

                for(var i = 0; i < this.myTasks.length; i++){
                    if (this.myTasks[i].actions == null) {
                        this.myTasks[i].actions = [];
                    }

                    this.myTasks[i].actions.unshift({ workflowActionId: -2, name: "View" });
                    this.myTasks[i].actions.push({ workflowActionId: -3, name: "Print" });
                    //this.myTasks[i].actions.push({ workflowActionId: 4, name: "Assign/Reassign" });
                    if (this.myTasks[i].dueDate != null) {
                        this.myTasks[i].dueDate = new Date(this.myTasks[i].dueDate);
                    }
                    this.myTasks[i].dateUpdated = new Date(this.myTasks[i].dateUpdated);
                }

                if(response.paging != null)
                    this.totalRecords = response.paging.total;
                else
                    this.totalRecords = 0;

                this.isLoadingWOData = false;
            }
        );
    }

    private getAllScheduledWOs(filters) {
        this.isLoadingScheduleData = true;
        this.maintenanceService.getScheduledWOs(filters).subscribe(
            (response)=>{
                console.log("Response Data");
                console.log(response);

                this.maintenances = response.data;
                console.log('Real Maintenances from Here', this.maintenances);
            
                for(var i = 0; i < this.maintenances.length; i++){
                    if (this.maintenances[i].actions == null) {
                        this.maintenances[i].actions = [];
                    }

                    this.maintenances[i].actions.unshift({ workflowActionId: -2, name: "View" });
                    //this.myTasks[i].actions.push({ workflowActionId: 4, name: "Assign/Reassign" });
                    this.maintenances[i].dueDate = new Date(this.maintenances[i].dueDate);
                    this.maintenances[i].dateUpdated = new Date(this.maintenances[i].dateUpdated);
                }

                if(response.paging != null)
                    this.totalRecordsScheduled = response.paging.total;
                else
                    this.totalRecordsScheduled = 0;
                this.isLoadingScheduleData = false;
            }
        );
    }


    onCancel(){
        this.addNewModal.hide();
    }

    cancelDelete() {
        this.deleteModal.hide();
    }

    saveDelete() {
        this._taskService.deleteWorkOrder(this.deleteWO.workOrderId).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.deleteModal.hide();
                this.refresh("delete_success", this.taskListsTable);

                this.refreshScheduled("delete_success", this.scheduleListsTable);
            } else {
                this.errDelete = response.resultCode.message;
            }

        });
    }

    // onFilter event
    onFilterWO(event) {
        console.log("onFilter event", event);

        this.filterMasterWO[event.field] = event.value;

        this.refresh(event, this.taskListsTable);
    }

    onFilterSchedule(event) {
        console.log("onFilterSchedule event", event);

        this.filterMasterSchedule[event.field] = event.value;

        this.refreshScheduled(event, this.scheduleListsTable);
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }

    private downloadAllWorkOrdersCSV(dt: DataTable) {
        let filters: any = this.buildFilter(dt, this.filterMasterWO);
        filters.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        this.maintenanceService.getAllWorkOrdersCSV(filters).subscribe(response => {
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            saveAs(blobData, "all_work_order.csv");
        });
    }

    private downloadAllScheduleWorkOrdersCSV(dt: DataTable) {
        let filters: any = this.buildFilter(dt, this.filterMasterSchedule);
        filters.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        this.maintenanceService.getAllScheduleWorkOrdersCSV(filters).subscribe(response => {
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            saveAs(blobData, "all_schedule_work_order.csv");
        });
    }
}
