import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { LocalDataSource } from 'ng2-smart-table';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss','./schedule.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ScheduleComponent {

	public calendarConfiguration:any;
	private _calendar:Object;

	@ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
	@Input() public source: LocalDataSource = new LocalDataSource();

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef
	
    ) {
//	  this.calendarConfiguration = this._calendarService.getData();
//	  this.calendarConfiguration.select = (start, end) => this._onSelect(start, end);  
  	}

	ngOnInit(){
	
	}
	  public onCalendarReady(calendar):void {
    this._calendar = calendar;
  }

//  private _onSelect(start, end):void {
//
//    if (this._calendar != null) {
//      let title = prompt('Event Title:');
//      let eventData;
//      if (title) {
//        eventData = {
//          title: title,
//          start: start,
//          end: end
//        };
//        jQuery(this._calendar).fullCalendar('renderEvent', eventData, true);
//      }
//      jQuery(this._calendar).fullCalendar('unselect');
//    }
//  }
//     
}  
