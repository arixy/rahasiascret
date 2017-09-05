import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./../styles/basic-theme.scss','./../styles/primeng.min.css', './../styles/modals.scss', './access-denied.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccessDenied {

    private totalRecords;
	deleteConfirm;
	delete_name;
    
    error_from_server = null;

    add_form_submitted = false;
    edit_form_submitted = false;
    
  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
      private router: Router
    ) {
        
        
        
  }
	
	 ngOnInit(){
		
	}

     showLoginPage() {
         this.router.navigate(['login']);
     }

     showPreviousPage() {
         history.back();
     }
    
     
}  