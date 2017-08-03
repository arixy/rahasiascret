import { Component, Input, ViewContainerRef, ElementRef, ChangeDetectorRef, ViewChild, ViewEncapsulation, ComponentFactoryResolver, ComponentRef, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';

import { DataTable, TabViewModule } from "primeng/primeng";

// services related
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';

// services
import { TaskService } from '../task.service';
import { PrintWOService } from './print-wo.service';
import { LocationService } from '../../services/location.service';

import { GlobalState, GlobalConfigs, WorkOrderStatuses, WorkflowActions } from '../../../global.state';

@Component({
    selector: 'print-wo',
    templateUrl: './print-wo.component.html',
    encapsulation: ViewEncapsulation.Native
})
export class PrintWOComponent implements OnDestroy {
    private dataModel;

    @Input("workOrderId")
    public workOrderIdParam;

    private subscription;

    @ViewChild('printView') printView: ElementRef;

    constructor(private _taskService: TaskService,
        private _printWorkOrderService: PrintWOService,
        private _changeDetector: ChangeDetectorRef) {
        this.dataModel = {};
    }

    ngOnInit() {
        this.subscription = this._taskService.eventEmitted$.subscribe(event => {
            if (event == "printWO") {

                this._printWorkOrderService.getWorkOrderAsPrint(this.workOrderIdParam).subscribe(response => {
                    if (response.resultCode.code == "0") {
                        this.dataModel = response.data;

                        // alter logo for test purpose
                        this.dataModel.logo = GlobalConfigs.APP_BASE_URL + this.dataModel.logo;

                        this._changeDetector.detectChanges();

                        let windowObj;
                        windowObj = window.open(
                            '',
                            'Print WO',
                            'width=480px,resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0'
                        );
                        windowObj.document.open();
                        windowObj.document.write('<!DOCTYPE html>  <html>  <style>    body {      font-family: Calibri;    }    td {      vertical-align: top;    }  @media print{   .logo-print{       width:291px;       height:109px; display: list-item; list-style-position: inside;   }}</style>' + this.printView.nativeElement.innerHTML + '</html>');
                        windowObj.document.close();
                        setTimeout(windowObj.print(), 500);
                    } else {

                    }
                });

                console.log("print-wo.component", this.workOrderIdParam);
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription != null) {
            this.subscription.unsubscribe();
        }
    }
}