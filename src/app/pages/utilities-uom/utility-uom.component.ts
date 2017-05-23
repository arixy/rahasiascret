import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { UtilityUomService } from './utility-uom.service'
@Component({
  selector: 'utility-uom',
  templateUrl: './utility-uom.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UtilityUom {

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

    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;

  	constructor(
		public fb: FormBuilder,
		public cdr: ChangeDetectorRef,
		public utilityUomService: UtilityUomService
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
		this.utilityUomService.getUtilities().subscribe(
            data => {
                this.utilities = data.data;
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
            }
        );	
	}

	public deleteClose(){
		this.deleteModal.hide();
	}
    public deleteUtilityUom(event){
		this.deleteConfirm= event;
		this.delete_name= event.name;
		this.deleteModal.show();
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);
			this.utilityUomService.deleteUtilityUom(this.deleteConfirm.utilityUomId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.ngOnInit();
            }
        );
		this.deleteModal.hide();
	}

    public addUtilityUom(){
        this.addNewModal.show();
    }
    
    public editUtilityUom(event){
        console.log('editing', event.utilityUomId);
        
		this.utility_edit = event.utilityUomId;
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
				this.utilityUomService.addUtilityUom(values).subscribe(
				(data) => {
					console.log('Return Data test', data);
				}
			);

            //console.log(response);
            this.addNewModal.hide();
			
			// Refresh Data
			this.ngOnInit();
		}
    }
  	public onSubmitEdit(values,event){
		console.log('edit form',values)
		if(this.edit_form.valid){
			 var formatted_object = Object.assign({}, {
               	id: this.utility_edit,
                name: values.edit_name,
                description: values.edit_description,
              });
			
			 let response = this.utilityUomService. updateUtilityUom(formatted_object).subscribe(
                (data) => {
                    console.log('Response Data', data);
                    this.editModal.hide();

                    // Refresh Data
                    this.ngOnInit();
                }
           );
		}
    }
   
}  
