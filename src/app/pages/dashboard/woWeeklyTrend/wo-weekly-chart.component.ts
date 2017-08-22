import { Component, ViewChild, OnDestroy } from '@angular/core';
import { SelectComponent } from 'ng2-select';
import * as moment from 'moment';

import { UIChart } from "primeng/primeng";

import { WorkOrderWeeklyChartService } from './wo-weekly-chart.service';

@Component({
    selector: 'wo-weekly-chart',
    templateUrl: './wo-weekly-chart.component.html',
    providers: [WorkOrderWeeklyChartService]
})
export class WorkOrderWeeklyChartComponent implements OnDestroy {
    private subscription;

	// error messages
    private errMsg = [];

    // chart filter base list
    private filterBaseModel = {
        _itemsWOCategories: [{ id: -1, text: "All" }]
    };

    private isLoading = false;

    private tempChartBuilderData = {
        date: [],
        categories: [],
		//data: null
    };

    private chartData;
    private chartColor = [22, 170, 216];
    //private chartColor = ["#20af42", "#d4ec18", "#ff0000", "#16aad8", "#7836d1"];

    private options = {
        title: {
            display: true,
            text: 'Weekly WO Trends per Category'
        },
        legend: {
            position: 'right'
        },
        scales: {
            xAxes: [{
                //stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "Date"
                },
            }],
            yAxes: [{
                //stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: "Total WO"
                },
                ticks: {
                    beginAtZero: true,
                }
            }]
        },
        elements: {
            line: {
                tension: 0,
            }
        }
    };


	// View Child
    //@ViewChild("selectWOCategory") _lsbFilterCategory: SelectComponent;
    @ViewChild("chart") _chartComponent: UIChart;

    constructor(
        private _workOrderWeeklyService: WorkOrderWeeklyChartService
    ) {
        this.chartData = {
            labels: [],
            datasets: []
        };
    }

    ngOnInit() {

        // load chart data
        this._workOrderWeeklyService.getWOWeeklyPerCategory(null).subscribe(response => {
            if (response.resultCode.code == "0") {
                // build date and categories from response
                let tmpTrendData = {};
                this.tempChartBuilderData.date = [];
                for (let data of response.data) {
                    let hasCategory = false;
                    for (let cat of this.tempChartBuilderData.categories) {
                        if (cat.id == data.woCategoryId) {
                            hasCategory = true;
                            break;
                        }
                    }
                    if (!hasCategory) {
                        this.tempChartBuilderData.categories.push({ id: data.woCategoryId, text: data.woCategoryName });
                        tmpTrendData[data.woCategoryId] = [];
                    }

                    if (this.tempChartBuilderData.date.indexOf(data.date) === -1) {
                        this.tempChartBuilderData.date.push(data.date);
                    }
                }

                // build data
                for (let data of response.data) {
                    tmpTrendData[data.woCategoryId].push(data.total);
                }

                let labels = [];
                for (let label of this.tempChartBuilderData.date) {
                    labels.push(label);
                }

                let datasets = [];
                let index = 0;
                for (let category of this.tempChartBuilderData.categories) {
                    let r = ('0' + (this.chartColor[0] + index * 150).toString(16)).substr(-2);
                    let g = ('0' + (this.chartColor[1] + index * 50).toString(16)).substr(-2);
                    let b = ('0' + (this.chartColor[2] + index * 50).toString(16)).substr(-2);
                    let seriesColor = '#' + r + g + b;
                    let series = {
                        label: category.text,
                        data: Array.from(tmpTrendData[category.id]),
                        fill: false,
                        backgroundColor: seriesColor,
                        borderColor: seriesColor,
                    }
                    index++;
                    datasets.push(series);
                }

                this.chartData.labels = labels;
                this.chartData.datasets = datasets;

                this._chartComponent.refresh();
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