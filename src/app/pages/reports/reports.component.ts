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
    selector: 'reports',
    templateUrl: './reports.component.html',
    encapsulation: ViewEncapsulation.None
})
export class Reports {
    private menuModel = [];

    constructor(
        public fb: FormBuilder,
        public cdr: ChangeDetectorRef
    ) {
        
    }

    ngOnInit() {
        let sitemaps = JSON.parse(localStorage.getItem('sitemaps'));
        let authorizedSitemaps = JSON.parse(localStorage.getItem('authorizedSitemaps'));

        if (authorizedSitemaps['ReportWorkOrder'] != null && authorizedSitemaps['ReportWorkOrder'].allowAccessOrView) {
            let sitemap = Object.assign({}, sitemaps['ReportWorkOrder']);
            if (sitemap != null) {
                sitemap.route = '/pages/wo-report';
                this.menuModel.push(sitemap);
            }
        }

        if (authorizedSitemaps['ReportConsumption'] != null && authorizedSitemaps['ReportConsumption'].allowAccessOrView) {
            let sitemap = Object.assign({}, sitemaps['ReportConsumption']);
            if (sitemap != null) {
                sitemap.route = '/pages/consumption-report';
                this.menuModel.push(sitemap);
            }
        }

        if (authorizedSitemaps['ReportPerformance'] != null && authorizedSitemaps['ReportPerformance'].allowAccessOrView) {
            let sitemap = Object.assign({}, sitemaps['ReportPerformance']);
            if (sitemap != null) {
                sitemap.route = '/pages/performance-report';
                this.menuModel.push(sitemap);
            }
        }

        console.log("report menus", this.menuModel);
    }
}  
