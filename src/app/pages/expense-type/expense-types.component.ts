import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { ExpenseTypeService } from './expense-type.service';
import { DataTable } from 'primeng/primeng';
import { DialogsService } from './../../services/dialog.service';
import { GrowlMessage, MessageSeverity, MessageLabels } from '../../popup-notification';

@Component({
  selector: 'expense-types',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./../styles/basic-theme.scss','./../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExpenseType {

    public expenses;
    public expenses$: Observable<any>;
    public processed_priorities;
    public form;
    public name;
    public description;
	public submitted;
	public edit_form;
	public edit_name;
	public edit_description;
	public expense_edit;
    private totalRecords;
	deleteConfirm;
	delete_name;
    
    error_from_server = [];

    add_form_submitted = false;
    edit_form_submitted = false;
    disabled = false;

    // Filtering
    filter_name_fc = new FormControl();
    filter_description_fc = new FormControl();

    filter_master = {
        "name": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "description": {
            "matchMode": "undefined", 
            "value": ""
        }
    }

    // Loading State
    dataLoading = false;
    submitLoading = false;

    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
    @ViewChild('dt') expenseTypesTable: DataTable;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public expenseTypeService: ExpenseTypeService,
    public dialogsService: DialogsService
    ) {
        // Add New Form
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'description': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
        });
        this.name = this.form.controls['name'];
        this.description = this.form.controls['description'];
        
	  this.edit_form = fb.group({
		  'edit_name' : ['', Validators.compose([Validators.required,Validators.minLength(2)])],
		   'edit_description' : ['', Validators.compose([Validators.required,Validators.minLength(2)])]
	  });
	  this.edit_name = this.edit_form.controls['edit_name'];
	  this.edit_description = this.edit_form.controls['edit_description'];
        // Test Moment
        var now = moment(new Date()); //todays date
        var end = moment("2015-12-1"); // another date
        var duration = moment.duration(now.diff(end));
        var days = duration.asDays();
        
        console.log(days);
        
        
  }
	
	 ngOnInit(){
		
	}

    ngAfterViewInit(){
         // Set manual filter debounce
        this.filter_name_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.name = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.expenseTypesTable);
                }
                
        );
        
        this.filter_description_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.description = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.expenseTypesTable);
                }
                
        );
        
        this.refresh(this.filter_master, this.expenseTypesTable);
    }

    public hideModal(){
        this.addNewModal.hide();
        this.editModal.hide();
    }

    public clearFormInputs(form){
        form.reset();
    }

    public cancel(){
        this.hideModal();
        
        // TODO: Logic to reset the form
        this.clearFormInputs(this.form);
    }

    refresh(filter_master, table: DataTable){
        
        this.dataLoading = true;
        
        // The only custom element is the filter master since we want to implement debounce
        var formatted_object = {};
        
        if(table == null){
            formatted_object = {
                filters : filter_master,
                first: 0,
                rows: 10,
                globalFilter: "",
                multiSortMeta: null,
                sortField: 'dateUpdated',
                sortOrder: -1
            }
        } else {
            formatted_object = {
                filters : filter_master,
                first: table.first,
                rows: table.rows,
                globalFilter: table.globalFilter,
                multiSortMeta: table.multiSortMeta,
                sortField: table.sortField,
                sortOrder: table.sortOrder    
            }
            
        }
        
        console.log('Shoot Refresh', formatted_object);
        this.expenseTypeService.getExpenseTypesFilter(formatted_object).subscribe(
            (response) => {
                this.dataLoading = false;
                console.log('Refresh Data', response);
                this.expenses = response.data;

                if(response.paging != null){
                    this.totalRecords = response.paging.total;
                } else {
                    this.totalRecords = 0;
                }
            }
        );
    }

    public deleteExpenseType(event){
		this.deleteConfirm= event;
		this.delete_name= event.name;
		//this.deleteModal.show();
        
        this.dialogsService.confirmDelete(this.delete_name, 'Test').subscribe(
            (response) => {
                if(response == true){
                    this.saveDelete();
                }
            }
        );
	}
	public saveDelete(){
	    this.expenseTypeService.deleteExpenseType(this.deleteConfirm.expenseTypeId).subscribe(
            (data) => {
                console.log('Return Data', data);
                if(data.resultCode.code == 0){
                    // Growl Message Success
                    GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.DELETE_SUCCESS);
                    this.refresh(this.filter_master, this.expenseTypesTable);    
                } else {
                    // Error
                    let error_delete = [];
                    error_delete = error_delete.concat(data.resultCode.message);
                    GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.DELETE_ERROR + '. ' + error_delete[0]);
                    
                }

                
            }
            );
		this.deleteModal.hide();
	}
    public addExpenseType(){
        this.addNewModal.show();
    }
    public deleteClose(){
		this.deleteModal.hide();
	}
    public editExpenseType(event){
        console.log('editing', event);
        
        this.disabled = false;
        this.edit_form.enable();
        
		this.expense_edit = event.expenseTypeId;
		// Inject Initial Value to the Edit Form
        this.edit_form.patchValue(
			{ 
				edit_name: event.name,
				edit_description: event.description
			
			}
		);
		
        // Display Form Modal
         this.editModal.show();
    }

    public viewExpenseType(event){
        console.log('Viewing', event);
        
		this.expense_edit = event.expenseTypeId;
		// Inject Initial Value to the Edit Form
        this.edit_form.patchValue(
			{ 
				edit_name: event.name,
				edit_description: event.description
			
			}
		);
		// Disable Form
        this.edit_form.disable();
        this.disabled = true;
        // Display Form Modal
         this.editModal.show();
    }

	public onSubmit(values){
		this.submitted = true;
        this.add_form_submitted = true;
        
	   	console.log('create component');
			if (this.form.valid) {
                
                this.submitLoading = true;
				this.expenseTypeService.addExpenseType(values).subscribe(
				(data) => {
					console.log('Return Data test', data);
					this.submitLoading = false;
                    if(data.resultCode.code == 0){
                        // Clear all input in the form
                        this.clearFormInputs(this.form);
                        
                        this.addNewModal.hide();
                        
                        // Success Message
                        GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                        
                        this.refresh(this.filter_master, this.expenseTypesTable);
                        
                        
                    } else {
                        
                        // Error
                        this.error_from_server = [];
                        this.error_from_server = this.error_from_server.concat(data.resultCode.message);
                    }
					
				}
			);

			

		}
    }
  	public onSubmitEdit(values,event){
		console.log('edit form',values);
        this.edit_form_submitted = true;
        
		if(this.edit_form.valid){
            this.submitLoading = true;
			 var formatted_object = Object.assign({}, {
               id: this.expense_edit,
                name: values.edit_name,
                description: values.edit_description,
              });
			
			 let response = this.expenseTypeService. updateExpenseType(formatted_object).subscribe(
                (data) => {
                    this.submitLoading = false;
                    console.log('Response Data', data);
                    this.editModal.hide();

                    // Refresh Data
                    this.refresh(this.filter_master, this.expenseTypesTable);
                }
           );
		}
    }

    public resetFilters(table){
        
        // Clear all filter in filter master. Might be Redundant
        this.filter_master.name.value = "";
        this.filter_master.description.value = "";
        
        // Actually changing the value on the input field. Auto Refresh
        this.filter_name_fc.setValue("");
        this.filter_description_fc.setValue("");
        
    }
     
}  
