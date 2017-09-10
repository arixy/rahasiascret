import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { PriorityService } from './priority.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DataTable } from 'primeng/primeng';
import * as moment from 'moment';
import { DialogsService } from './../../services/dialog.service';
import { GrowlMessage, MessageSeverity, MessageLabels } from '../../popup-notification';

@Component({
  selector: 'priorities',
  templateUrl: './priorities.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Priorities {

    public priorities;
    public priorities$: Observable<any>;
    public processed_priorities;
    public form;
    public edit_form;
    public name;
    public description;
    public escalationPeriodInDays;
	public edit_name;
    public edit_description;
    public edit_escalationPeriodInDays;
	public priority_edit;
	public submitted;
    private totalRecords;
	deleteConfirm;
	delete_name;
    
    error_from_server = [];

    add_form_submitted = false;
    edit_form_submitted = false;

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
    public submitLoading = false;

    disabled = false;
    
    @ViewChild('addNewModal') addNewModal: ModalDirective;
	@ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
    @ViewChild('dt') prioritiesTable: DataTable;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public priorityService: PriorityService,
    public dialogsService: DialogsService
    ) {
        // Add New Form
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required])],
          'description': ['', Validators.compose([Validators.required])],
          'escalationPeriodInDays': ['', Validators.compose([Validators.required])]
        });
        this.name = this.form.controls['name'];
        this.description = this.form.controls['description'];
        this.escalationPeriodInDays = this.form.controls['escalationPeriodInDays'];
	  
	   // editForm
        this.edit_form = fb.group({
          'edit_name': ['', Validators.compose([Validators.required])],
          'edit_description': ['', Validators.compose([Validators.required])],
          'edit_escalationPeriodInDays': ['', Validators.compose([Validators.required])]
        });
        this.edit_name = this.edit_form.controls['edit_name'];
        this.edit_description = this.edit_form.controls['edit_description'];
        this.edit_escalationPeriodInDays = this.edit_form.controls['edit_escalationPeriodInDays'];
        
        // Test Moment
        var now = moment(new Date()); //todays date
        var end = moment("2015-12-1"); // another date
        var duration = moment.duration(now.diff(end));
        var days = duration.asDays();
        
        console.log(days);
        
  }
	ngOnInit(){
		 /*this.priorityService.getPriorities().subscribe(
            data => {
                this.priorities = data.data;
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
            }
        );	*/
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
                    this.refresh(this.filter_master, this.prioritiesTable);
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
                    this.refresh(this.filter_master, this.prioritiesTable);
                }
                
        );
        
        this.refresh(this.filter_master, this.prioritiesTable);
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
        this.priorityService.getPrioritiesFilter(formatted_object).subscribe(
            (response) => {
                this.dataLoading = false;
                console.log('Refresh Data', response);
                this.priorities = response.data;

                if(response.paging != null){
                    this.totalRecords = response.paging.total;
                } else {
                    this.totalRecords = 0;
                }
            }
        );
    }

	public deleteClose(){
		this.deleteModal.hide();
	}

	public deletePriority(event){
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
		console.log('test', this.deleteConfirm.userId);	this.priorityService.deletePriority(this.deleteConfirm.woPriorityId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.refresh(this.filter_master, this.prioritiesTable);
            }
        );
		this.deleteModal.hide();
	}

    public hideChildModal(){
        this.addNewModal.hide();
    }
 	public hideChildModalEdit(){
		this.editModal.hide();
    }
  public addPriority(){
        this.addNewModal.show();
    }
    
    public editPriority(priority){
        console.log('editing', priority);
        this.disabled = false;
        this.edit_form.enable();
        
		this.priority_edit = priority.woPriorityId;
		// Inject Initial Value to the Edit Form
        this.edit_form.patchValue(
			{ 
				edit_name: priority.name,
				edit_description: priority.description,
				edit_escalationPeriodInDays: priority.escalationPeriodInDays
			
			}
		);
		
        // Display Form Modal
         this.editModal.show();   
    }

    public viewPriority(priority){
        console.log('Viewing', priority);
        this.priority_edit = priority.woPriorityId;
		// Inject Initial Value to the Edit Form
        this.edit_form.patchValue(
			{ 
				edit_name: priority.name,
				edit_description: priority.description,
				edit_escalationPeriodInDays: priority.escalationPeriodInDays
			
			}
		);
		
        this.disabled = true;
        this.edit_form.disable();
		
        // Display Form Modal
         this.editModal.show();   
    }

	public onSubmit(values:Object):void {
		this.submitted = true;
        this.add_form_submitted = true;
        
		 console.log('create component');
		if (this.form.valid) {
			
            this.submitLoading = true;

			this.priorityService.addPriority(values).subscribe(
				(data) => {
                    this.submitLoading = false;
					console.log('Return Data', data);
                            
                    if(data.resultCode.code == 0){
                        
                        this.addNewModal.hide();
                        
                        // Growl Message Success
                        GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                        
                        // Refresh Data
                        this.refresh(this.filter_master, this.prioritiesTable);
                        
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
               	id: this.priority_edit,
                name: values.edit_name,
                description: values.edit_description,
                escalationPeriodInDays: values.edit_escalationPeriodInDays
              });
			
			 let response = this.priorityService. updatePriority(formatted_object).subscribe(
                (data) => {
                    this.submitLoading = false;
                    console.log('Response Data', data);
                    this.editModal.hide();

                    // Refresh Data
                    this.refresh(this.filter_master, this.prioritiesTable);
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
