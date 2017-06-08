import {Component, Input, ViewContainerRef, ChangeDetectorRef, ViewChild, ViewEncapsulation, ComponentFactoryResolver, ComponentRef, OnDestroy } from '@angular/core';
//import { Observable } from 'rxjs/Observable';
//import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
//import * as moment from 'moment';
//import { LocalDataSource } from 'ng2-smart-table';

// component related
//import { Component, ViewChild, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
//import { LocalDataSource } from 'ng2-smart-table';
//import { ModalDirective } from 'ng2-bootstrap';
//import { FormGroup, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';
//import { DatePickerOptions, DateModel } from 'ng2-datepicker';

import { DataTable, TabViewModule } from "primeng/primeng";

// services related
import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

// services
import { TaskService } from './task.service';
import { LocationService } from '../../services/location.service';

// custom components
//import { AddNewWorkOrderComponent } from './add-wo.component';
import { SingleRequestComponent } from './forms/singlerequest.component';
import { TenantRequestComponent } from './forms/tenantrequest.component';
import { OwnerRequestComponent } from './forms/ownerrequest.component';
import { GuestRequestComponent } from './forms/guestrequest.component';
import { RecurringRequestComponent } from './forms/recurringrequest.component';
import { PreventiveRequestComponent } from './forms/preventiverequest.component';

import { WorkOrderStatuses, WorkflowActions } from '../../global.state';

@Component({
  selector: 'my-task',
  templateUrl: './task.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss','./task.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TaskService, LocationService],
  entryComponents: [SingleRequestComponent, TenantRequestComponent, OwnerRequestComponent, GuestRequestComponent, RecurringRequestComponent, PreventiveRequestComponent]
})
export class TaskComponent implements OnDestroy{
    // #TEST REGION
    //public __lst_type = [
    //    { id: 1, text: "Preventive Maintenance" },
    //    { id: 2, text: "Recurring Request" },
    //    { id: 3, text: "Single Request" },
    //    { id: 4, text: "Tenant Request" },
    //    { id: 5, text: "Guest Request" },
    //    { id: 6, text: "Owner Request" }
    //];

    //public __lst_actions = [
    //    {id: -1, text: "Create"},
    //    { id: -2, text: "View" },
    //    { id: -3, text: "View (Schedule)"},
    //    { id: 2, text: "Edit" },
    //    { id: -4, text: "Edit (Schedule)" },
    //    { id: 3, text: "Delete" },
    //    { id: 4, text: "Assign/Reassign" },
    //    { id: 5, text: "Cancel" },
    //    { id: 6, text: "Pending" },
    //    { id: 7, text: "In Progress" },
    //    { id: 8, text: "Close for Confirmation" },
    //    { id: 9, text: "Complete" },
    //    { id: 10, text: "Return" },
    //];

    //public __sel_type: { id, text };
    //public __sel_action: { id, text };

    //public __setSelectedType(event) {
    //    this.__sel_type = event;
    //}

    //public __setSelectedAction(event) {
    //    this.__sel_action = event;
    //}

    //public testOpenModal() {
    //    this.viewModalBody.clear();
    //    if (this.__sel_type.id == this.SINGLE_TIME_REQUEST) {
    //        this.currentOpenModal = this.createNewSingleRequestComponent(this.viewModalBody, SingleRequestComponent);
    //        // send specific parameters if needed
    //        //this.currentOpenModal.instance.variable_name = value
    //    } else if (this.__sel_type.id == this.TENANT_REQUEST) {
    //        this.currentOpenModal = this.createNewTenantRequestComponent(this.viewModalBody, TenantRequestComponent);
    //    } else if (this.__sel_type.id == this.GUEST_REQUEST) {
    //        this.currentOpenModal = this.createNewGuestRequestComponent(this.viewModalBody, GuestRequestComponent);
    //    } else if (this.__sel_type.id == this.OWNER_REQUEST) {
    //        this.currentOpenModal = this.createNewOwnerRequestComponent(this.viewModalBody, OwnerRequestComponent);
    //    } else if (this.__sel_type.id == this.RECURRING_REQUEST) {
    //        this.currentOpenModal = this.createNewRecurringRequestComponent(this.viewModalBody, RecurringRequestComponent);
    //    } else if (this.__sel_type.id == this.PREVENTIVE_REQUEST) {
    //        this.currentOpenModal = this.createNewPreventiveRequestComponent(this.viewModalBody, PreventiveRequestComponent);
    //    }

    //    this.currentOpenModal.instance.selectedWoType = this.__sel_type;

    //    if (this.__sel_action.id == -3) {
    //        // Edit WO
    //        this.currentOpenModal.instance.actionType = { workflowActionId: -2, name: this.__sel_action.text };
    //        this.currentOpenModal.instance.isSchedule = true;
    //    } else if (this.__sel_action.id == -4) {
    //        // Edit WO
    //        this.currentOpenModal.instance.actionType = { workflowActionId: 2, name: this.__sel_action.text };
    //        this.currentOpenModal.instance.isSchedule = true;
    //    } else {
    //        this.currentOpenModal.instance.actionType = { workflowActionId: this.__sel_action.id, name: this.__sel_action.text };
    //    }
        

    //    // change modal title
    //    this.modalTitle = "ADD NEW WO - " + this.__sel_type.text + "(" + this.__sel_action.text + ")";

    //    this.addNewModal.show();
    //}
    //testImage() {
    //    //this._taskService.getImage().subscribe((response) => {
    //    //    //console.log("testImage", response.blob());
    //    //    //var blob = new Blob([response.blob()], { type: 'image/*' });
    //    //    //var url = URL.createObjectURL(blob);
    //    //    //console.log("blob url", url);
    //    //    // can't access _body because it is private
    //    //    // no method appears to exist to get to the _body without modification             
    //    //    let data: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type')});
    //    //    console.log("data", data);
    //    //    //var url = URL.createObjectURL(data);
    //    //    var reader = new FileReader();
    //    //    reader.onload = function (e) {
    //    //        //window.location.href = reader.result;
    //    //        window.open(reader.result);
    //    //        //var a: MSFileSaver = new MSFileSaver();
    //    //    }
    //    //    reader.readAsDataURL(data);
    //    //});
    //}
    // #END TEST REGION

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


    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
    @ViewChild('deleteModal') deleteModal: ModalDirective;
    //@Input() public source: LocalDataSource = new LocalDataSource();

    //@ViewChild('dynamicModalContent', {read: ViewContainerRef}) viewAddNewModal: ViewContainerRef;
    @ViewChild('dynamicModalBody', {read: ViewContainerRef}) viewModalBody: ViewContainerRef;
    

    private currentOpenModal: any;
    private modalTitle: string;
    
    private subscription: Subscription;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private _taskService: TaskService,
    private _locationService: LocationService
    ) {
      // hardcoded wo type list
      this.woTypes = [{ id: 1, label: "Preventive Maintenance"},
                        {id: 2, label: "Recurring Request"},
                        {id: 3, label: "Single Request"},
                        {id: 4, label: "Tenant Request"},
                        {id: 5, label: "Guest Request"},
                        {id: 6, label: "Owner Request"},
                       ];

        // define Add New Form Group
        this.formGroupAdd = fb.group({
            'taskName': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'taskDesc': ['', Validators.compose([])],
            'selectedCategory': ['', Validators.compose([])]
        });
        this.taskName = this.formGroupAdd.controls['taskName'];

        this.subscription = this._taskService.eventEmitted$.subscribe(event => {
            console.log("event: " + event);
            this.addNewModal.hide();
        });
  	}

	ngOnInit(){
        this.getAllMyTasks(this.buildFilter(null));
	}

    // btn Add New Work Order Listener
    createNewWorkOrder(selectedType){
        console.log(selectedType);
        this.selectedWoType = selectedType;
        
        //================================
        // START CREATE MODAL BODY
        //================================
        // clear modal body
        this.viewModalBody.clear();
        
        /*// create content component
        let componentBody = new (this.fb, this.cdr) : AddNewWorkOrderComponent;
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);
        
        // create actual component
        this.currentOpenModal = this.viewModalBody.createComponent(addNewContent);*/

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

        // change modal title
        this.modalTitle = "Create " + selectedType.label;

        this.addNewModal.show();
        console.log(this.addNewModal);
    }
    
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

    createNewRecurringRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService): RecurringRequestComponent }): ComponentRef<RecurringRequestComponent> {
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(addNewContent);

        return modalContentRef;
    }

    createNewPreventiveRequestComponent(view: ViewContainerRef, componentBody: { new (fb, cdr, _locationService, _taskService, _userService, _assetService, _roleService, _workOrderService, _expenseTypeService, _priorityService, _entityService): PreventiveRequestComponent }): ComponentRef<PreventiveRequestComponent> {
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);

        // create actual component
        let modalContentRef = view.createComponent(addNewContent);

        return modalContentRef;
    }

    doAction(modelData, selectedAction){
        console.log("doAction", modelData, selectedAction);

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
        for(var i=0; i < this.__lst_type.length; i++){
            if(this.__lst_type[i].id == modelData.woTypeId){
                this.modalTitle += this.__lst_type[i].text;
                break;
            }
        }
        // end set modal title

        this.currentOpenModal.instance.actionType = selectedAction;
        this.currentOpenModal.instance.selectedWO = modelData;
        this.addNewModal.show();
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
                    this.myTasks[i].dueDate = new Date(this.myTasks[i].dueDate);
                    this.myTasks[i].dateUpdated = new Date(this.myTasks[i].dateUpdated);
                }

                if(response.paging != null)
                    this.totalRecords = response.paging.total;
                else
                    this.totalRecords = 0;
            }
        );
    }
    
    onCancel(){
        this.addNewModal.hide();
    }

    // close opening modal
    hideChildModal(currentOpenModal){
        currentOpenModal.hide();
    }
    
    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
}
