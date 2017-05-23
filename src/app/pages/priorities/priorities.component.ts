import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { PriorityService } from './priority.service';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'priorities',
  templateUrl: './priorities.component.html',
  styleUrls: ['./priorities.component.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
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
	deleteConfirm;
	delete_name;

    @ViewChild('addNewModal') addNewModal: ModalDirective;
	@ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public priorityService: PriorityService
    ) {
        // Add New Form
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'description': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'escalationPeriodInDays': ['']
        });
        this.name = this.form.controls['name'];
        this.description = this.form.controls['description'];
        this.escalationPeriodInDays = this.form.controls['escalationPeriodInDays'];
	  
	   // editForm
        this.edit_form = fb.group({
          'edit_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'edit_description': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'edit_escalationPeriodInDays': ['']
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
		 this.priorityService.getPriorities().subscribe(
            data => {
                this.priorities = data.data;
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
            }
        );	
	}
	public deleteClose(){
		this.deleteModal.hide();
	}
	public deletePriority(event){
		this.deleteConfirm= event;
		this.delete_name= event.fullname;
		this.deleteModal.show();
	
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);	this.priorityService.deletePriority(this.deleteConfirm.woPriorityId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.ngOnInit();
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

	public onSubmit(values:Object):void {
		this.submitted = true;
		 console.log('create component');
		if (this.form.valid) {
			console.log(values);
		  // your code goes here
			this.priorityService.addPriority(values).subscribe(
				(data) => {
					console.log('Return Data', data);
				}
			);

			this.addNewModal.hide();

			// Refresh Data
			this.ngOnInit();
		}
	  }
	public onSubmitEdit(values,event){
    	console.log('edit form',values)
		if(this.edit_form.valid){
			 var formatted_object = Object.assign({}, {
               	id: this.priority_edit,
                name: values.edit_name,
                description: values.edit_description,
                escalationPeriodInDays: values.edit_escalationPeriodInDays
              });
			
			 let response = this.priorityService. updatePriority(formatted_object).subscribe(
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
