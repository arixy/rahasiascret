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
import { AddNewWorkOrderComponent } from './add-wo.component';

@Component({
  selector: 'my-task',
  templateUrl: './task.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss','./task.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [TaskService, LocationService],
  entryComponents: [AddNewWorkOrderComponent]
})
export class TaskComponent implements OnDestroy{
    private myTasks : any;
    private totalRecords;

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

    @ViewChild('dynamicModalContent', {read: ViewContainerRef}) viewAddNewModal: ViewContainerRef;
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

    /*createFormAddNewWO(addNewWOComponent : { new(fb, cdr) : AddNewWorkOrderComponent}): ComponentRef<AddNewWorkOrderComponent>{
        this.viewAddNewModal.clear();

        let addNewWOModal = this.componentFactoryResolver.resolveComponentFactory(addNewWOComponent);

        //let dialogComponentRef = this.viewAddNewModal.createComponent(addNewWOModal);

        let dialogComponentRef = this.viewAddNewModal.createComponent(addNewWOModal);

        return dialogComponentRef;
    }*/

    // btn Add New Work Order Listener
    createNewWorkOrder(selectedType){
        console.log(selectedType);
        this.selectedWoType = selectedType;

        //this.currentOpenModal = this.createFormAddNewWO(AddNewWorkOrderComponent);
        //this.currentOpenModal.instance.showModal();

        //var tes = this.createFormAddNewWO(AddNewWorkOrderComponent);
        //tes.instance.showModal();
        //console.log(tes);
        
        
        
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
        
        this.currentOpenModal = this.createNewComponent(this.viewModalBody, AddNewWorkOrderComponent);
        this.currentOpenModal.instance.selectedWoType = selectedType;
        
        // send parameters
        //this.currentOpenModal.instance.variable_name = value

        this.addNewModal.show();
        console.log(this.addNewModal);

        // change modal title
        this.modalTitle = "ADD NEW WO - " + selectedType.label;
    }
    
    createNewComponent(view : ViewContainerRef, componentBody : { new(fb, cdr, _locationService, _taskService, _userService) : AddNewWorkOrderComponent}): ComponentRef<AddNewWorkOrderComponent>{
        // create content component
        let addNewContent = this.componentFactoryResolver.resolveComponentFactory(componentBody);
        
        // create actual component
        let modalContentRef = view.createComponent(addNewContent);
        
        return modalContentRef;
    }

    doAction(modelData, selectedAction){
        console.log("doAction");
        console.log(modelData);
        console.log(selectedAction);
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
                    this.myTasks[i].actions = [{id: 1, label: "View"}];
                    this.myTasks[i].dateUpdated = new Date(this.myTasks[i].dateUpdated);
                }

                if(response.paging != null)
                    this.totalRecords = response.paging.total;
                else
                    this.totalRecords = 0;

//                console.log("Altered Response Data");
//                console.log(this.myTasks);
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
