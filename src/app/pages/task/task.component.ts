import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { LocalDataSource } from 'ng2-smart-table';

// services
import { TaskService } from './task.service';

@Component({
  selector: 'utility-types',
  templateUrl: './task.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TaskService]
})
export class TaskComponent {
    private myTasks : any;
    private totalRecords;


	@ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
	@Input() public source: LocalDataSource = new LocalDataSource();

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    private _taskService : TaskService
    ) {
      
  	}

	ngOnInit(){
        this.getAllMyTask(null);
	}
    
    doAction(modelData, selectedAction){
        console.log("doAction");
        console.log(modelData);
        console.log(selectedAction);
    }
    
    refresh($event, table){
        console.log("customRefresh");
        console.log($event);
        
        this.getAllMyTask($event);
    }
    
    private getAllMyTask($event){
        this._taskService.getAllMyTasks($event).subscribe(
            (response)=>{
                console.log("Response Data");
                console.log(response);
                
                this.myTasks = response.data;
                
                for(var i = 0; i < this.myTasks.length; i++){
                    this.myTasks[i].actions = [{id: 1, label: "View"}];
                }
                
                if(response.paging != null)
                    this.totalRecords = response.paging.total;
                else
                    this.totalRecords = 0;
            }
        );
    }
}  
