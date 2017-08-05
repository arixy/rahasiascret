import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { EntityTypeService } from './../../services/entity-type.service';
import { DataTable } from 'primeng/primeng';
import * as moment from 'moment';

@Component({
  selector: 'entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Entities {

    public error_from_server = null;
    public entities;
    public entity_types;
	public submitted;
	public entitys;
    public form;
    public edit_form;
    public name;
    public description;
    public address1;
    public contact_person;
    public phone1;
	public entity_edit;
    
    public items_entity_type = null;
    public selected_entity_type = null;
    public selected_edit_entity_type = null;

	//edit
	public edit_name;
    public edit_description;
    public edit_address1;
    public edit_contact_person;
    public edit_phone1;
	public edit_entities;
	deleteConfirm;
	delete_name;

    add_form_submitted = false;
    edit_form_submitted = false;

    // Filtering Form Conrol
    filter_name_fc = new FormControl();

    filter_master = {
        "name": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "description": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "address1": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "address2": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "contactPerson": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "phone1": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "phone2": {
            "matchMode": "undefined", 
            "value": ""
        }, 
        "phone3": {
            "matchMode": "undefined", 
            "value": ""
        },
        "entityTypeId": {
            "matchMode": "undefined", 
            "value": "1"
        }
    }

    // Entity Type (Vendors, Guests, etc)
    current_entity_type_pointer = null;
    current_entity_type_name = null;

    dataLoading = false;
    totalRecords;
	
    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
    @ViewChild('dt') entitiesTable: DataTable;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public entityService: EntityService,
    public entityTypeService: EntityTypeService,
    private route: ActivatedRoute
    ) {
        // Add New Form
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required])],
          'description': ['', Validators.compose([Validators.required])],
			'address1': ['', Validators.compose([Validators.required])],
			'contact_person': ['', Validators.compose([Validators.required])],
			'phone1': ['', Validators.compose([Validators.required])],
          
        });
        this.name = this.form.controls['name'];
        this.description = this.form.controls['description'];
        this.address1 = this.form.controls['address1'];
        this.contact_person= this.form.controls['contact_person'];
        this.phone1= this.form.controls['phone1'];
		
		//edit
		 this.edit_form = fb.group({
          'edit_name': ['', Validators.compose([Validators.required])],
          'edit_description': ['', Validators.compose([Validators.required])],
			'edit_address1': ['', Validators.compose([Validators.required])],
			'edit_contact_person': ['', Validators.compose([Validators.required])],
			'edit_phone1': ['', Validators.compose([Validators.required])],
          
        });
        
        this.edit_name = this.edit_form.controls['edit_name'];
        this.edit_description = this.edit_form.controls['edit_description'];
        this.edit_address1 = this.edit_form.controls['edit_address1'];
        this.edit_contact_person= this.edit_form.controls['edit_contact_person'];
        this.edit_phone1= this.edit_form.controls['edit_phone1'];
		
  }
	ngOnInit(){
        
		/*this.entityService.getEntities().subscribe(
            data => {
                this.entities = data.data;
				console.log('test ent',this.entities);
                console.log('Full Data', data);
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
            }
        ); */
        
        
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
                    this.refresh(this.filter_master, this.entitiesTable);
                }
                
        );
        
        this.route.params.subscribe(
            (params) => {
                /*this.entityService.getEntitiesByType(params['entity_type_id']).subscribe(
                    (response) => {
                        console.log('Entities by Type', response);
                        this.entities = response.data;
                        
                        
                    }
                );*/
                
                this.selected_entity_type = params['entity_type_id'];
                this.selected_edit_entity_type = params['entity_type_id'];
                
                // Set Filter
                this.filter_master.entityTypeId.value = params['entity_type_id'];
                
                this.current_entity_type_pointer = +params['entity_type_id'] - 1;
                
                // Initialize Select Box
                this.entityTypeService.getEntityTypes().subscribe(
                   (data) => {
                       this.entity_types = data.data;
                       
                       // Mapping of current Entity Type
                       this.current_entity_type_name = this.entity_types[this.current_entity_type_pointer].name;
                       console.log('Current Entity Type Name', this.current_entity_type_name);
                       
                       this.items_entity_type = data.data;
                       console.log('Entity Type', this.entity_types);

                       this.items_entity_type = this.items_entity_type.map(
                            (entity_type) => {
                                return Object.assign({}, {
                                   id: entity_type.entityTypeId,
                                    text: entity_type.name
                                });
                            }
                        );
                   } 
                );
                
                this.refresh(this.filter_master, this.entitiesTable);
            }
        );
        
        
        
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
        this.entityService.getEntitiesFilter(this.selected_entity_type, formatted_object).subscribe(
            (response) => {
                this.dataLoading = false;
                console.log('Refresh Data', response);
                this.entities = response.data;

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
    public addEntity(){
        this.addNewModal.show();
    }
	public hideModal(){
        this.addNewModal.hide();
        this.editModal.hide();
    }
    public cancel(){
        this.hideModal();
    }
    public deleteEntity(event){
		this.deleteConfirm= event;
		this.delete_name= event.name;
		this.deleteModal.show();	
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);
			this.entityService.deleteEntity(this.deleteConfirm.entityId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.ngOnInit();
            }
        );
		this.deleteModal.hide();
	}
    public onSubmit(values){
      	this.submitted = true;
        this.add_form_submitted = true;
	   	console.log('create component', values);
        values.entity_type_id = this.selected_entity_type;
			if (this.form.valid) {
				console.log(values);
				// your code goes here
				this.entityService.addEntity(values).subscribe(
				(data) => {
                    if(data.resultCode.code == 0){
                        console.log('Success!');
                        this.addNewModal.hide();
                        // Refresh Data
                        this.ngOnInit();
                        
                    } else {
                        // Fail
                        this.error_from_server = data.resultCode.message;
                        // No Need to Close the Modal or Refresh Data
                    }
					console.log('Return Data test', data);
				}
			);

			
		}
    }
    
    
    public hideEditModal(){
        this.editModal.hide();
    }
	  public editEntity(event){
        console.log('Priority Edit',event);
//        
		  this.entity_edit = event.priorityId;
			// Inject Initial Value to the Edit Form
			this.edit_form.patchValue(
				{
					edit_name: event.name, 
					edit_description: event.description,
					edit_address1: event.address1,
					edit_contact_person: event.contactPerson,
					edit_phone1: event.phone1
				}
			);
            // TODO: Initialize Select Box
			// Display Form Modal
			 this.editModal.show();
        
    }
		public onSubmitEdit(values,event){
		console.log('edit form',values);
        
            this.edit_form_submitted = true;
		if(this.edit_form.valid){
			 var formatted_object = Object.assign({}, {
               	id: this.entity_edit.id,
                name: values.edit_name,
                description: values.edit_description,
                address1: values.edit_address1,
                contact_person: values.edit_contact_person,
                phone1: values.edit_phone1,
                entity_type_id: this.selected_edit_entity_type
              });
			
			 let response = this.entityService. updateEntity(formatted_object).subscribe(
                (data) => {
                    console.log('Response Data', data);
                    this.editModal.hide();

                    // Refresh Data
                    this.ngOnInit();
                }
           );
		}
    }
    
	
    loadDataLazy(event) {
        //in a real application, make a remote request to load data using state metadata from event
        //event.first = First row offset
        //event.rows = Number of rows per page
        //event.sortField = Field name to sort with
        //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
        //filters: FilterMetadata object having field as key and filter value, filter matchMode as value
        console.log('Event Lazy', event);
        //imitate db connection over a network
    }
    public selectedEntityType(event){
        console.log('');
        this.selected_entity_type = event.id;
    }
    public selectedEditEntityType(event){
        this.selected_edit_entity_type = event.id;
    }

    public resetFilters(table){
        
        // Clear all filter in filter master. Might be Redundant
        this.filter_master.name.value = "";
        
        // Actually changing the value on the input field. Auto Refresh
        this.filter_name_fc.setValue("");
    
    }
}  
