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
})
export class PrintWOComponent implements OnDestroy {
    private dataModel: any = {};

    @Input("workOrderId")
    public workOrderIdParam;

    private subscription;

    @ViewChild('printView') printView: ElementRef;
    @ViewChild('imageContainer') imageContainer: ElementRef;
    @ViewChild('companyLogo') companyLogo: HTMLImageElement;

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
                        //this.dataModel.logo = GlobalConfigs.APP_BASE_URL + "/logo";

                        this.loadImage(GlobalConfigs.APP_BASE_URL + "/logo").then(base64 => {
                            this.imageContainer.nativeElement.innerHTML = '<img src="' + base64 + '" />';
                            this._changeDetector.detectChanges();

                            let windowObj;
                            windowObj = window.open(
                                '',
                                'Print WO',
                                'width=480px,resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0'
                            );
                            windowObj.document.open();
                            windowObj.document.write('<!DOCTYPE html>  <html> <head> <script>function doPrint(){if(document.readyState == "complete"){window.print()}else{setTimeout(doPrint, 200);}} </script> <style>    body {      font-family: Calibri;    }    td {      vertical-align: top;    }  @media print{   .logo-print{       max-width:291px;       max-height:64px; display: list-item; list-style-position: inside;   }}</style></head><body>' + this.printView.nativeElement.innerHTML + '<script>doPrint();</script></body></html>');
                            windowObj.document.close();
                            //setTimeout(windowObj.print(), 10000);
                        });
                    } else {

                    }
                });

                console.log("print-wo.component", this.workOrderIdParam);
            }
        });
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.crossOrigin = "Anonymous";
            image.onload = function () {
                console.log(image.width);
                let canvas = <HTMLCanvasElement>document.createElement("CANVAS");
                let context = canvas.getContext('2d');

                canvas.height = image.height;
                canvas.width = image.width;
                context.drawImage(image, 0, 0);

                let dataURL = canvas.toDataURL("image/png");
                canvas = null;
                resolve(dataURL);

            };
            image.src = url;
        });
    }

    ngOnDestroy() {
        if (this.subscription != null) {
            this.subscription.unsubscribe();
        }
    }
}