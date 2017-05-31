import { Component, Input, Output, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';

import { TaskService } from './task.service';
import { LocationService } from '../../services/location.service';
import { AssetService } from '../../services/asset.service';
import { UsersService } from '../users/users.service';

@Component({
    selector: 'tab-content-recurring',
    templateUrl: './recurring.component.html'
})
export class TabContentRecurringComponent {
    @Input('error_msg') error_msg: any;
    @Input() items_repeats: any;

    ngOnInit() {
        console.log("error_msg", this.error_msg);
    }

    @Output()
    removeSelectBoxValue(field: string, event) {

    }
}