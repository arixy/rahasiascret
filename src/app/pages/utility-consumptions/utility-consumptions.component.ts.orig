import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { UtilityConsumptionsService } from './utility-consumptions.service';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
    
@Component({
  selector: 'utility-consumptions',
  templateUrl: './utility-consumptions.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UtilityConsumptions {

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
	deleteConfirm;
	delete_name;

    // Select Box
    items_utility_type = [{
        id: 1,
        text: 'Utility Type 1'
    },
    {
        id: 2,
        text: 'Utility Type 2'
    }
    ]
    
    // Date
    date: DateModel;
    date_options: DatePickerOptions;
    public selected_uc_date;

    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public utilityUomService: UtilityConsumptionsService
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
	 	this.utilityUomService.getUtilityConsumptions().subscribe(
            data => {
                this.utilities = data;
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
            }
        );
	}
	public deleteClose(){
		this.deleteModal.hide();
	}
    public deleteUtilityUom(event){
		console.log('delete', event);
		this.deleteConfirm= event;
		this.delete_name= event.name;
		this.deleteModal.show();
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);
        this.utilityUomService.deleteUtilityUom(this.deleteConfirm.userId);
        this.deleteModal.hide();    
        this.ngOnInit();
        
	}
    public addUtilityConsumption(){
        this.addNewModal.show();
    }
    public utilityConsumptionDate(data){
        if(data.type == 'dateChanged'){
            this.selected_uc_date = data.data.formatted;
        }
        console.log('Date Object:', this.date);
        console.log('Data Passed:', data);
    }
    public selectedUtilityType(event){

    }
    public editUtilityUom(event){
        console.log('editing', event);
        
		this.utility_edit = event;
		// Inject Initial Value to the Edit Form
        this.edit_form.patchValue({ edit_name: event.name });
		  this.edit_form.patchValue({ edit_description: event.description });
		
        // Display Form Modal
         this.editModal.show();
    }
    public onSubmit(values){
       this.submitted = true;
		if(this.form.valid){
			 console.log('Form Values uti:', values);
			 var formatted_object = Object.assign({}, {
               id: values.id,
                name: values.name,
                description: values.description,
              });
			
			 let response = this.utilityUomService.addUtilityUom(formatted_object);
            //console.log(response);
            this.addNewModal.hide();
		}
    }
  	public onSubmitEdit(values,event){
		console.log('edit form',values)
		if(this.edit_form.valid){
			 var formatted_object = Object.assign({}, {
               id: this.utility_edit.id,
                name: values.edit_name,
                description: values.edit_description,
              });
			
			 let response = this.utilityUomService. updateUtilityUom(formatted_object);
			
			this.utilities = this.utilityUomService.getUtilitiesNormal();
			console.log('After Edit.. ', this.utilities);
            //console.log(response);
             this.editModal.hide();
		}
    }
   
}  
