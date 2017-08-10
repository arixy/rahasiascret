import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { UtilityTypesService } from './utility-types.service';
import { LocalDataSource } from 'ng2-smart-table';
import { DataTable } from 'primeng/primeng';
import { DialogsService } from './../../services/dialog.service';

@Component({
  selector: 'utility-types',
  templateUrl: './utility-types.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UtilityTypes {

    public utilities;
    public utilities$: Observable<any>;
    public processed_priorities;
    public form;
    public name;
    public description;
	public submitted;
	public edit_form;
	public edit_name;
	public edit_description;
	public utility_edit;
    private totalRecords;
	deleteConfirm;
	delete_name;
    
    error_from_server = null;
    
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

	@ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
    @ViewChild('dt') utilityTypesTable: DataTable;
	@Input() public source: LocalDataSource = new LocalDataSource();

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public utilityTypesService: UtilityTypesService,
    public dialogsService: DialogsService
    ) {
        // Add New Form
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required])],
          'description': ['', Validators.compose([Validators.required])]
        });
	    this.edit_form = fb.group({
		  'edit_name' : ['', Validators.compose([Validators.required])],
		   'edit_description' : ['', Validators.compose([Validators.required])]
	  });
	  
        this.name = this.form.controls['name'];
        this.description = this.form.controls['description'];
        
	
	  this.edit_name = this.edit_form.controls['edit_name'];
	  this.edit_description = this.edit_form.controls['edit_description'];
  	}

	ngOnInit(){
		/*this.utilityTypesService.getUtilities().subscribe(
            data => {
 				this.utilities = data.data;
				console.log('test on init', this.utilities);
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
                    this.refresh(this.filter_master, this.utilityTypesTable);
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
                    this.refresh(this.filter_master, this.utilityTypesTable);
                }
                
        );
        
        this.refresh(this.filter_master, this.utilityTypesTable);
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
        this.utilityTypesService.getUtilityTypesFilter(formatted_object).subscribe(
            (response) => {
                this.dataLoading = false;
                console.log('Refresh Data', response);
                this.utilities = response.data;

                if(response.paging != null){
                    this.totalRecords = response.paging.total;
                } else {
                    this.totalRecords = 0;
                }
            }
        );
    }

    public deleteUtilityType(event){
		this.deleteConfirm = event;
		this.delete_name = event.name;
		/*this.deleteModal.show();*/
        
        this.dialogsService.confirmDelete('Test', 'Test').subscribe(
            (response) => {
                console.log('Response from Delete Modal', response);
                if(response == true){
                    this.saveDelete();
                } 
            }
        );
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);
			this.utilityTypesService.deleteUtilityType(this.deleteConfirm.utilityTypeId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.refresh(this.filter_master, this.utilityTypesTable);
            }
        );
		//this.deleteModal.hide();
	}

    public addUtilityType(){
         this.addNewModal.show();
		
    }
    
    public editUtilityType(event){
        console.log('editing', event);
        
		this.utility_edit = event.utilityTypeId;
		console.log('this.utility_edit', this.utility_edit);
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

	public onSubmit(values:Object):void {
		this.submitted = true;
        this.add_form_submitted = true;
        
		 console.log('create component');
		 console.log('create component', values);
		if (this.form.valid) {
			console.log(values);
		  // your code goes here
			this.utilityTypesService.addUtilityType(values).subscribe(
				(data) => {
					console.log('Return Data', data);
                    
                    // Refresh Data 
                    this.refresh(this.filter_master, this.utilityTypesTable);
				}
			);
			this.form.patchValue(
            	{   
                	name:'',
                	description: '',
				}
        	);
			this.addNewModal.hide();
		}

	  }

  	public onSubmitEdit(values,event){
		console.log('edit form',values);
        this.edit_form_submitted = true;
        
		if(this.edit_form.valid){
			var formatted_object = Object.assign({}, {
				id: this.utility_edit,
                name: values.edit_name,
                description: values.edit_description,
			});
			
			let response = this.utilityTypesService. updateUtilityType(formatted_object).subscribe(
                (data) => {
                    console.log('Response Data', data);
                    this.editModal.hide();

                    // Refresh Data
                    this.ngOnInit();
                }
           );
		  console.log('submit response',response);
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
