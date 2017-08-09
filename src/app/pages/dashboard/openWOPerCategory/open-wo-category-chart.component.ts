import { Component, ViewChild, OnDestroy } from '@angular/core';
import { SelectComponent } from 'ng2-select';

import { UIChart } from "primeng/primeng";

import { OpenWorkOrderCategoryChartService } from './open-wo-category-chart.service';
import { WorkOrderService as WorkOrderCategoryService } from '../../../services/work-order.service';
import { PriorityService } from '../../priorities/priority.service';

@Component({
    selector: 'wo-category-chart',
    templateUrl: './open-wo-category-chart.component.html',
    providers: [OpenWorkOrderCategoryChartService]
})
export class OpenWorkOrderCategoryChartComponent implements OnDestroy {
    private subscription;

	// error messages
    private errMsg = [];

    // chart filter base list
    private filterBaseModel = {
        _itemsWOCategories: [{ id: -1, text: "All" }]
    };

    private isLoading = false;

    private tempChartBuilderData = {
        categories: null,
        priorities: null,
		data: null
    };

    private chartData;
    private chartColor = ["#20af42", "#d4ec18", "#ff0000", "#16aad8", "#7836d1"];

    private options = {
        title: {
            display: true,
            text: 'Open WO per Category'
        },
        legend: {
            position: 'right'
        },
        scales: {
            xAxes: [{
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "Category"
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
        private _workOrderService: OpenWorkOrderCategoryChartService,
        private _woCategoryService: WorkOrderCategoryService,
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
                if (this.tempChartBuilderData.categories != null
                    && this.tempChartBuilderData.priorities != null
                    && this.tempChartBuilderData.data != null) {
                    console.log("Loading completed!");
                    
                    let tmpChartData = {};

                    // clean tempChartBuilderData.categories
                    this.tempChartBuilderData.categories = []
                    for (let resData of this.tempChartBuilderData.data) {
                        let found = false;
                        for (let item of this.tempChartBuilderData.categories){
                            if (item.id == resData.woCategoryId) {
                                found = true;
                            }
                        }
                        if (!found) {
                            this.tempChartBuilderData.categories.push({ id: resData.woCategoryId, text: resData.woCategoryName });
                        }
                    }

                    // build initial data per category's priorities'
                    for (let priority of this.tempChartBuilderData.priorities) {
                        if (tmpChartData[priority.id] == null) {
                            tmpChartData[priority.id] = {
                                name: priority.text,
                                categories: {},
                            }
                            for (let category of this.tempChartBuilderData.categories) {
                                tmpChartData[priority.id].categories[category.id] = 0;
                            }
                        }
                    }

                    // read response and put into temp chart data
                    for (let data of this.tempChartBuilderData.data) {
                        if (data.priorityId != null && tmpChartData[data.priorityId] != null) {
                            tmpChartData[data.priorityId].categories[data.woCategoryId] = data.total
                        }
                    }

                    // ready chart labels
                    this.chartData.labels = [];
                    for (let category of this.tempChartBuilderData.categories) {
                        this.chartData.labels.push(category.text);
                    }

                    // ready chart data
                    let formattedDataset = [];
                    let index = 0;
                    for (let data in tmpChartData) {
                        // for each priority
                        if (tmpChartData.hasOwnProperty(data)) {
                            let tmpInnerData = [];

                            for (let innerData in tmpChartData[data].categories) {
                                // get total WO for priority per category
                                tmpInnerData.push(tmpChartData[data].categories[innerData]);
                            }

                            let tmpDataset = {
                                label: tmpChartData[data].name,
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
                    console.log("Failed to Build Chart. Incomplete Data");
                }
            }
        });

        // load all categories
        this._woCategoryService.getWOs().subscribe(response => {
            if (response.resultCode.code == "0") {
                let __responseData = response.data;

                let woCategories = [];
                for (let data of __responseData) {
                    woCategories.push({ id: data.woCategoryId, text: data.name });
                }

                // add to chart builder data
                this.tempChartBuilderData.categories = Array.from(woCategories);

                // add to filter
                woCategories.unshift({ id: -1, text: "All" });
                this.filterBaseModel._itemsWOCategories = woCategories;

				// call update chart
                this._workOrderService.announceEvent("updateChart");

                
            } else {
                this.errMsg = [];
                this.errMsg = this.errMsg.concat(response.resultCode.message);
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
        this._workOrderService.getOpenWOPerCategory(null).subscribe(response => {
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