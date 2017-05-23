import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { WeekendService } from './weekend.service';
import { HolidayService } from './../holidays/holiday.service';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';

@Component({
  selector: 'weekends',
  templateUrl: './weekends.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Weekends {

    // From Date
    from_date_model: DateModel;
    from_options: DatePickerOptions;
    selected_from_date;
    
    // To Date
    to_date_model: DateModel;
    to_options: DatePickerOptions;
    selected_to_date;
    
    public weekends = null;
    public weekends_holidays;
    public weekend$: Observable<any>;
    public holidays;
    public form;
    public holiday_name_fc;
    public name;
    public from_date;
    public to_date;
    public flag_holiday;
	public submitted;
	public edit_form;
	public edit_form_date;
	public edit_to_date;
    public edit_flag_holiday;
	public utility_edit;

    @ViewChild('addNewModal') addNewModal: ModalDirective;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public weekendService: WeekendService,
    public holidayService: HolidayService
    ) {
        
  }

    ngOnInit(){
        this.form = this.fb.group({
            'name': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
        });
        
        this.holiday_name_fc = this.form.controls['name'];
        
        this.weekendService.getWeekendsAndHolidays().subscribe(
            data => {
                this.weekends_holidays = data.data;
                console.log('Weekend Holidays', this.weekends_holidays);
                this.holidays = this.weekends_holidays.holidays;
                this.weekends = this.weekends_holidays.weekend[0];
                console.log('Just Weekend', this.weekends);
            }
        );
    }
    
    
    onChange(){
        console.log('Weekend', this.weekends);
        
    }
    
    checkAll(){
        this.weekends.isMondayWeekend = true;
        this.weekends.isTuesdayWeekend = true;
        this.weekends.isWednesdayWeekend = true;
        this.weekends.isThursdayWeekend = true;
        this.weekends.isFridayWeekend = true;
        this.weekends.isSaturdayWeekend = true;
        this.weekends.isSundayWeekend = true;
        
        this.weekendService.updateWeekend(this.weekends);
    }
    clearAll(){
        this.weekends.isMondayWeekend = false;
        this.weekends.isTuesdayWeekend = false;
        this.weekends.isWednesdayWeekend = false;
        this.weekends.isThursdayWeekend = false;
        this.weekends.isFridayWeekend = false;
        this.weekends.isSaturdayWeekend = false;
        this.weekends.isSundayWeekend = false;
        
        this.weekendService.updateWeekend(this.weekends);
    }
    
    addHoliday(){
        this.addNewModal.show();
    }
     
    public fromDate(data){
        if(data.type == 'dateChanged'){
            this.selected_from_date = data.data.formatted;
        }
        console.log('Data Passed:', data);
    }

    public toDate(data){
        if(data.type == 'dateChanged'){
            this.selected_to_date = data.data.formatted;
        }
        console.log('Data Passed:', data);
    }
    
    public convertCheckToArray(){
        let weekend_array = [];
        if(this.weekends.isMondayWeekend == true){
            weekend_array.push(1);
        }
        if(this.weekends.isTuesdayWeekend == true){
            weekend_array.push(2);
        }
        if(this.weekends.isWednesdayWeekend == true){
            weekend_array.push(3);
        }
        if(this.weekends.isThursdayWeekend == true){
            weekend_array.push(4);
        }
        if(this.weekends.isFridayWeekend == true){
            weekend_array.push(5);
        }
        if(this.weekends.isSaturdayWeekend == true){
            weekend_array.push(6);
        }
        if(this.weekends.isSundayWeekend == true){
            weekend_array.push(7);
        }
        console.log('Weekend Array', weekend_array);
        return weekend_array;
    }

    public onSubmit(values):void {
        console.log('Values from form', values);
        if(this.form.valid){
            var formatted_object = Object.assign({}, {
               weekends: this.convertCheckToArray(),
                holidays: [
                    {
                        name: values.name,
                        fromDate: this.selected_from_date,
                        toDate: this.selected_to_date,
                        flagHoliday: true
                    }
                ]
            });
            console.log('Formatted Object', formatted_object);
            this.weekendService.addWeekendsHolidays(formatted_object).subscribe(
                response => {
                    console.log('Response Data', response);
                    this.ngOnInit();
                }
            );
            
            this.addNewModal.hide();
        }
    }

    public hideModal(){
        this.addNewModal.hide();
    }
}  
