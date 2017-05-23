import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { UtilityTypesService } from './utility-types.service';
import { LocalDataSource } from 'ng2-smart-table';

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
	deleteConfirm;
	delete_name;

	@ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
	@Input() public source: LocalDataSource = new LocalDataSource();

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public utilityTypesService: UtilityTypesService
    ) {
        // Add New Form
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'description': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
        });
	    this.edit_form = fb.group({
		  'edit_name' : ['', Validators.compose([Validators.required,Validators.minLength(2)])],
		   'edit_description' : ['', Validators.compose([Validators.required,Validators.minLength(2)])]
	  });
	  
        this.name = this.form.controls['name'];
        this.description = this.form.controls['description'];
        
	
	  this.edit_name = this.edit_form.controls['edit_name'];
	  this.edit_description = this.edit_form.controls['edit_description'];
  	}

	ngOnInit(){
		this.utilityTypesService.getUtilities().subscribe(
            data => {
 				this.utilities = data.data;
				console.log('test on init', this.utilities);
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
            }
        );	
	}

    public deleteUtilityType(event){
		this.deleteConfirm= event;
		this.delete_name= event.name;
		this.deleteModal.show();
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);
			this.utilityTypesService.deleteUtilityType(this.deleteConfirm.utilityTypeId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.ngOnInit();
            }
        );
		this.deleteModal.hide();
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
		 console.log('create component');
		 console.log('create component', values);
		if (this.form.valid) {
			console.log(values);
		  // your code goes here
			this.utilityTypesService.addUtilityType(values).subscribe(
				(data) => {
					console.log('Return Data', data);
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
		// Refresh Data
			this.ngOnInit();
	  }

  	public onSubmitEdit(values,event){
		console.log('edit form',values)
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
     
}  
