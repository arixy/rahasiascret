import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { WorkOrderService } from '../../services/work-order.service';
import { MaintenanceService } from './../preventatives/maintenance.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'inputs',
  templateUrl: './woreports.component.html',
  styleUrls: ['./woreports.component.scss', './primeng.min.css'],
  encapsulation: ViewEncapsulation.None
})
export class WOReports {

    public work_orders;
    public work_orders$: Observable<any>;
    public processed_work_orders;

     
  constructor(
    public woCategoryService: WorkOrderService,
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public maintenanceService: MaintenanceService
    ) {
        
        // Test Moment
        var now = moment(new Date()); //todays date
        var end = moment("2015-12-1"); // another date
        var duration = moment.duration(now.diff(end));
        var days = duration.asDays();
        console.log(days);
        
        this.maintenanceService.getMaintenances().subscribe(
            data => {
                this.work_orders = data;
                this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
                console.log('Processed WO', this.processed_work_orders);
            }
        );
  }
    public lookupRowStyleClass(rowData) {
        // Tobe changed to actual duration KPI comparison
        // Compare all to fixed twenty hours
        if(rowData.duration != 0 && rowData.duration <= 72){
            return 'highlight-wo-safe';
        }
        if(rowData.duration != 0 && rowData.duration > 72){
            return 'highlight-wo-danger';
        }
        return '';
        //return rowData.accountDisabled ? 'disabled-account-row' : '';
    }
    
    public injectDuration(work_orders){
        return work_orders.map(
            (work_order) => {
                console.log('Work Order', work_order);
                var start = moment(work_order.start_date);
                if(work_order.completed_at != ''){
                    var end = moment(work_order.completed_at);
                    var duration = moment.duration(end.diff(start));
                    var duration_hours = Math.round(duration.asHours());
                    console.log('Duration Hour', duration_hours);
                    return Object.assign({}, work_order, {
                        duration: duration_hours
                    });
                }
                 return Object.assign({}, work_order, {
                    duration: 0 
                 });
            }
        );
    }
     
     
}  
