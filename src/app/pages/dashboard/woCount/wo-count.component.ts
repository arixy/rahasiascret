import { Component, OnDestroy } from '@angular/core';

import { WorkOrderStatuses } from '../../../global.state';

import { WorkOrderCountService } from './wo-count.service';

@Component({
    selector: 'dashboard-wo-count',
    styleUrls: ['wo-count.scss'],
    templateUrl: './wo-count.component.html'
})
export class WorkOrderCountComponent implements OnDestroy {
    private subscription;

    private errMsg = [];

    // count model
    private woCountModel = {
        "new": {
            total: 0,
            label: "New",
            baseColor: "#16aad8",
            highlightColor: "#23b7e5"
        },
        "inprogress": {
            total: 0,
            label: "In Progress",
            baseColor: "#6051b5",
            highlightColor: "#7266ba"
        },
        "resolved":{
            total: 0,
            label: "Resolved",
            baseColor: "#20af42",
            highlightColor: "#27c24c"
        }
    };


    constructor(
        private _woCountService: WorkOrderCountService
    ) {
        this._woCountService.getWOCount().subscribe(response => {
            if (response.resultCode.code == "0") {
                // process response data
                let tmpResponseData = response.data;
                for (let data of tmpResponseData) {
                    if (data.statusId == WorkOrderStatuses.NEW) {
                        this.woCountModel.new.total = data.count;
                        //this.woCountModel.new.baseColor = data.hexColor;
                    } else if (data.statusId == WorkOrderStatuses.IN_PROGRESS) {
                        this.woCountModel.inprogress.total = data.count;
                        //this.woCountModel.inprogress.baseColor = data.hexColor;
                    } if (data.statusId == WorkOrderStatuses.COMPLETE) {
                        this.woCountModel.resolved.total = data.count;
                        //this.woCountModel.resolved.baseColor = data.hexColor;
                    }
                }
            } else {
                this.errMsg = [response.resultCode.msg];
            }
        });
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        if (this.subscription != null) {
            this.subscription.unsubscribe();
        }
    }
}
