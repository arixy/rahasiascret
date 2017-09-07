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
import { DialogsService } from './../../services/dialog.service';

// custom components
//import { AddNewWorkOrderComponent } from './add-wo.component';
import { SingleRequestComponent } from './forms/singlerequest.component';
import { TenantRequestComponent } from './forms/tenantrequest.component';
import { OwnerRequestComponent } from './forms/ownerrequest.component';
import { GuestRequestComponent } from './forms/guestrequest.component';
import { RecurringRequestComponent } from './forms/recurringrequest.component';
import { PreventiveRequestComponent } from './forms/preventiverequest.component';
import { PrintWOComponent } from './print/print-wo.component';

import { GlobalState, WorkOrderStatuses, WorkflowActions } from '../../global.state';
import { GrowlMessage, MessageSeverity, MessageLabels } from '../../popup-notification';

@Component({
  selector: 'my-task',
  templateUrl: './task.component.html',
  //styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss','./task.component.css'],
  //styleUrls: ['../preventatives/modals.scss', '../preventatives/tablestyle.scss', '../preventatives/purple-green.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TaskService, LocationService],
  entryComponents: [SingleRequestComponent, TenantRequestComponent, OwnerRequestComponent, GuestRequestComponent, RecurringRequestComponent, PreventiveRequestComponent, PrintWOComponent]
})
export class TaskComponent implements OnDestroy{

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

    // master wo list
    private woTypesMaster = [{ id: 1, label: "Preventive Maintenance", menuId: 'PreventiveWorkOrder' },
    { id: 2, label: "Recurring Request", menuId: 'RecurringWorkOrder' },
    { id: 3, label: "Single Request", menuId: 'SingleWorkOrder' },
    { id: 4, label: "Tenant Request", menuId: 'TenantWorkOrder' },
    { id: 5, label: "Guest Request", menuId: 'GuestWorkOrder' },
    { id: 6, label: "Owner Request", menuId: 'OwnerWorkOrder' },
    ];
    // selected wo type
    public selectedWoType: { id, label };

    // delete
    private deleteWO;
    private errDelete;

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
    @ViewChild('dt') taskListsTable: DataTable;
    //@Input() public source: LocalDataSource = new LocalDataSource();

    //@ViewChild('dynamicModalContent', {read: ViewContainerRef}) viewAddNewModal: ViewContainerRef;
    @ViewChild('dynamicModalBody', { read: ViewContainerRef }) viewModalBody: ViewContainerRef;
    @ViewChild('printView', { read: ViewContainerRef }) printView: ViewContainerRef;
    

    private currentOpenModal: any;
    private modalTitle: string;

    // print data
    private selPrintWOId;

    // private
    private isLoadingData = true;


    private subscription: Subscription;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private _taskService: TaskService,
    private _locationService: LocationService,
    private _dialogService: DialogsService
    ) {
      this.deleteWO = {};

      this.subscription = this._taskService.eventEmitted$.subscribe(event => {
          console.log("event: " + event);

          // separate action between events
          if (event == "addNewModal_btnCancelOnClick") {
              this.addNewModal.hide();
          } else if (event == "addNewModal_btnSaveOnClick_createSuccess") {
              this.addNewModal.hide();
              this.getAllMyTasks(this.buildFilter(this.taskListsTable));
          } else if (event == "addNewModal_btnSaveOnClick_updateSuccess") {
              this.addNewModal.hide();
              this.getAllMyTasks(this.buildFilter(this.taskListsTable));
          }
      });
  	}

	ngOnInit(){

        // build creatable WO Type button
        this.woTypes = [];

        let sitemaps = JSON.parse(localStorage.getItem('sitemaps'));
        let authorizedSitemaps = JSON.parse(localStorage.getItem('authorizedSitemaps'));
        for (let master of this.woTypesMaster) {
            if (authorizedSitemaps[master.menuId] != null && authorizedSitemaps[master.menuId].allowAccessOrView) {
                let sitemap = sitemaps[master.menuId];
                this.woTypes.push({ id: master.id, label: sitemap.name });
            }
        }

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

        // change modal title
        this.modalTitle = "Add New " + selectedType.label;

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

        this.viewModalBody.clear();

        this.selPrintWOId = modelData.workOrderId;
        this.cdr.detectChanges();

        if (selectedAction.workflowActionId == WorkflowActions.PRINT) {
            this._taskService.announceEvent("printWO");
            return;
        } else if (selectedAction.workflowActionId == WorkflowActions.DELETE) {
            this.deleteWO = modelData;
            //this.deleteModal.show();
            this._dialogService.confirmDelete(modelData.taskName, '').subscribe(
                (response) => {
                    if (response == true) {
                        this.saveDelete();
                    }
                }
            );
            return;
        }

        if (modelData.woTypeId == this.SINGLE_TIME_REQUEST) {
            this.currentOpenModal = this.createNewSingleRequestComponent(this.viewModalBody, SingleRequestComponent);
            //this.modalTitle = "Work Order - Single Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypesMaster[2];
        } else if (modelData.woTypeId == this.GUEST_REQUEST) {
            this.currentOpenModal = this.createNewGuestRequestComponent(this.viewModalBody, GuestRequestComponent);
            //this.modalTitle = "Work Order - Guest Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypesMaster[4];
        } else if (modelData.woTypeId == this.TENANT_REQUEST) {
            this.currentOpenModal = this.createNewTenantRequestComponent(this.viewModalBody, TenantRequestComponent);
            //this.modalTitle = "Work Order - Tenant Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypesMaster[3];
        } else if (modelData.woTypeId == this.OWNER_REQUEST) {
            this.currentOpenModal = this.createNewOwnerRequestComponent(this.viewModalBody, OwnerRequestComponent);
            //this.modalTitle = "Work Order - Owner Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypesMaster[5];
        } else if (modelData.woTypeId == this.RECURRING_REQUEST) {
            this.currentOpenModal = this.createNewRecurringRequestComponent(this.viewModalBody, RecurringRequestComponent);
            //this.modalTitle = "Work Order - Recurring Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypesMaster[1];
        } else if (modelData.woTypeId == this.PREVENTIVE_REQUEST) {
            this.currentOpenModal = this.createNewPreventiveRequestComponent(this.viewModalBody, PreventiveRequestComponent);
            //this.modalTitle = "Work Order - Preventative Request (" + selectedAction.name + ")";
            this.currentOpenModal.instance.selectedWoType = this.woTypesMaster[0];
        }

        // set modal title
        if(selectedAction.workflowActionId == WorkflowActions.IN_PROGRESS){
            this.modalTitle = "Set " + selectedAction.name + " ";
        }else{
            this.modalTitle = selectedAction.name + " ";
        }
        

        for (var i = 0; i < this.woTypesMaster.length; i++){
            if (this.woTypesMaster[i].id == modelData.woTypeId){
                this.modalTitle += this.woTypesMaster[i].label;
                break;
            }
        }
        // end set modal title

        this.currentOpenModal.instance.actionType = selectedAction;
        this.currentOpenModal.instance.selectedWO = modelData;
        this.addNewModal.show();
    }

    refresh($event, table){
        //console.log("customRefresh");
        //console.log($event);
        //console.log(table);

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

    private getAllMyTasks(filters) {
        this.isLoadingData = true;
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

                this.isLoadingData = false;
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
        this.isLoadingData = true;
        this._taskService.deleteWorkOrder(this.deleteWO.workOrderId).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.deleteModal.hide();
                this.getAllMyTasks(this.buildFilter(this.taskListsTable));
                GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.DELETE_SUCCESS);
            } else {
                this.errDelete = response.resultCode.message;
                this.isLoadingData = false;
                GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.DELETE_ERROR);
            }
        });
    }

    // close opening modal
    hideChildModal(currentOpenModal){
        currentOpenModal.hide();
    }
    
    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
    public exportMyTaskCSV(dataTable: DataTable){
        let filters: any = this.buildFilter(dataTable);
        filters.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("export CSV");
        this._taskService.getMyTaskCSV(filters).subscribe(
            (data)=>{      
                console.log("prepared download file ");   
                this.downloadFileMyTaskToCSV(data);
            }
        );

    }

    private downloadFileMyTaskToCSV(data){
        var dataCsv= new Blob([data.blob()], {type: 'text/csv;charset=utf-8;'});
        var urlCsv=window.URL.createObjectURL(dataCsv);
        var link = document.createElement('a');
        
        link.setAttribute('href', urlCsv);
        link.setAttribute('download', "MyTask.csv");
        link.click();
    }
}
