import { Component, ViewChild, OnDestroy } from '@angular/core';
import { SelectComponent } from 'ng2-select';

import { UIChart } from "primeng/primeng";

import { OpenWorkOrderPICChartService } from './open-wo-pic-chart.service';
import { UsersService } from '../../users/users.service';
import { PriorityService } from '../../priorities/priority.service';

@Component({
    selector: 'wo-pic-chart',
    templateUrl: './open-wo-pic-chart.component.html',
    providers: [OpenWorkOrderPICChartService]
})
export class OpenWorkOrderPICChartComponent implements OnDestroy {
    private subscription;

	// error messages
    private errMsg = [];

    // chart filter base list
    private filterBaseModel = {
        _itemsWOCategories: [{ id: -1, text: "All" }]
    };

    private isLoading = false;

    private tempChartBuilderData = {
        users: null,
        priorities: null,
		data: null
    };

    private chartData;
    private chartColor = ["#20af42", "#d4ec18", "#ff0000", "#16aad8", "#7836d1"];

    private options = {
        title: {
            display: true,
            text: 'Open WO per PIC'
        },
        legend: {
            position: 'right'
        },
        scales: {
            xAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "PIC"
                },
            }],
            yAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "Total WO"
                },
                ticks: {
                    beginAtZero: true,
                }
            }]
        }
    };


	// View Child
    //@ViewChild("selectWOCategory") _lsbFilterCategory: SelectComponent;
    @ViewChild("chart") _chartComponent: UIChart;

    constructor(
        private _workOrderService: OpenWorkOrderPICChartService,
        private _userService: UsersService,
        private _priorityService: PriorityService
    ) {
        this.chartData = {
            labels: ["Category #1","Category #2","Category #3"],
            datasets: [
                {
                    label: "Priority #1",
                    data: [0, 0, 0],
                    backgroundColor: this.chartColor[0]
                }, {
                    label: "Priority #2",
                    data: [0, 0, 0],
                    backgroundColor: this.chartColor[1]
                }, {
                    label: "Priority #3",
                    data: [0, 0, 0],
                    backgroundColor: this.chartColor[2]
                }
            ]
        };
    }

    ngOnInit() {
		//this._lsbFilterCategory.active = [{ id: -1, text: "All" }];

        // refresh chart data
        this.subscription = this._workOrderService.eventEmitted$.subscribe(event => {
            if (event == "updateChart") {
                if (this.tempChartBuilderData.priorities != null
                    && this.tempChartBuilderData.data != null) {
                    //this.errMsg.push("Loading completed!");
                    
                    let tmpPICChartData = {};

                    // clean tempChartBuilderData.users
                    this.tempChartBuilderData.users = []
                    for (let resData of this.tempChartBuilderData.data) {
                        if (resData.total == null || resData.total == 0) continue;

                        let found = false;
                        for (let item of this.tempChartBuilderData.users){
                            if (item.id == resData.picId) {
                                found = true;
                            }
                        }
                        if (!found) {
                            this.tempChartBuilderData.users.push({ id: resData.picId, text: resData.picName });
                        }
                    }
                    console.log("users", this.tempChartBuilderData);

                    // build initial data per category's priorities'
                    for (let priority of this.tempChartBuilderData.priorities) {
                        if (tmpPICChartData[priority.id] == null) {
                            tmpPICChartData[priority.id] = {
                                name: priority.text,
                                users: {},
                            }
                            for (let user of this.tempChartBuilderData.users) {
                                tmpPICChartData[priority.id].users[user.id] = null;
                            }
                        }
                    }

                    // read response and put into temp chart data
                    for (let data of this.tempChartBuilderData.data) {
                        if (data.priorityId != null && tmpPICChartData[data.priorityId] != null) {
                            tmpPICChartData[data.priorityId].users[data.picId] = data.total
                        }
                    }

                    // ready chart labels
                    this.chartData.labels = [];
                    for (let user of this.tempChartBuilderData.users) {
                        this.chartData.labels.push(user.text);
                    }

                    // ready chart data
                    let formattedDataset = [];
                    let index = 0;
                    for (let data in tmpPICChartData) {
                        // for each priority
                        if (tmpPICChartData.hasOwnProperty(data)) {
                            let tmpInnerData = [];

                            for (let innerData in tmpPICChartData[data].users) {
                                // get total WO for priority per user
                                tmpInnerData.push(tmpPICChartData[data].users[innerData]);
                            }

                            let tmpDataset = {
                                label: tmpPICChartData[data].name,
                                data: tmpInnerData,
                                backgroundColor: this.chartColor[index]
                            };

                            index = (index + 1) % this.chartColor.length;

                            formattedDataset.push(tmpDataset);
                        }
                    }

                    this.chartData.datasets = formattedDataset;
                    console.log("formattedDataset", this.chartData.datasets);
                    console.log("labels", this.chartData.labels);

                    console.log(this.chartData, this._chartComponent);
                    this._chartComponent.refresh();
                } else {
                    //this.errMsg.push("Failed to Build Chart. Incomplete Data");
                }
            }
        });

        // load all priorities
        this._priorityService.getPriorities().subscribe(response => {
            if (response.resultCode.code == "0") {
                let __responseData = response.data;

                let priorities = [];
                for (let data of __responseData) {
                    priorities.push({ id: data.woPriorityId, text: data.name });
                }

				// add to chart builder data
                this.tempChartBuilderData.priorities = Array.from(priorities);

                // call update chart
                this._workOrderService.announceEvent("updateChart");

                
            } else {
                this.errMsg = [];
                this.errMsg = this.errMsg.concat(response.resultCode.message);
            }
        });

        // load chart data
        this._workOrderService.getOpenWOPerPIC(null).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.tempChartBuilderData.data = response.data;

                this._workOrderService.announceEvent("updateChart");
            } else {
                this.errMsg = [];
                this.errMsg = this.errMsg.concat(response.resultCode.message);
            }
        });
    }

    updateChart() {
        this._chartComponent.refresh();
    }

    ngOnDestroy() {
        if (this.subscription != null) {
            this.subscription.unsubscribe();
        }
    }
}