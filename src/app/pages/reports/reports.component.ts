import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
//import { WorkOrderService } from '../../../../services/work-order.service';
import { WorkOrderService } from '../../services/work-order.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ModalDirective } from 'ng2-bootstrap';
import { Routes } from '@angular/router';

@Component({
  selector: 'inputs',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Reports {

    //@ViewChild('childModal') childModal: ModalDirective;
    //@ViewChild('childModalEdit') childModalEdit: ModalDirective;
    public work_orders;
public work_orders$: Observable<any>;
  public form;
  public name;
  public description;
  public prefix;
  public kpi_baseline;
  public submitted;    
  public editForm;
  public edit_name;
  public edit_description;
  public edit_prefix;
  public edit_kpi_baseline; 
  public items_location; 
     
  public location_editwo = {
      id:null,
      name:'',
      description:'',
      prefix:'',
      kpi_baseline:'',
  //  parent_wo_id: null
  };
public settings = {
    mode: 'external',
    add: {
      addButtonContent: '<i class="ion-ios-plus-outline"></i>',
      createButtonContent: '<i class="ion-checkmark"></i>',
      cancelButtonContent: '<i class="ion-close"></i>',
    },
    edit: {
      editButtonContent: '<i class="ion-edit"></i>',
      saveButtonContent: '<i class="ion-checkmark"></i>',
      cancelButtonContent: '<i class="ion-close"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="ion-trash-a"></i>',
      confirmDelete: true
    },
    columns: {
      id: {
        title: 'ID',
        type: 'string'
      },
      name: {
        title: 'Name',
        type: 'string'
      },
      description: {
        title: 'Description',
        type: 'string'
      },
      prefix: {
        title: 'Prefix',
        type: 'string'
      },
      kpi_baseline: {
        title: 'E-mail',
        type: 'string'
      }
    }
  };
  @Input() public source: LocalDataSource = new LocalDataSource();
  
     
  constructor(
    public woService: WorkOrderService,
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef
    ) {
  }
     
     
}  
