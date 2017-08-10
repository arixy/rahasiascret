import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnDestroy, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import { SelectComponent, SelectItem } from 'ng2-select';
import * as moment from 'moment';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import { DataTable, TabViewModule, Panel, UIChart } from "primeng/primeng";
import { saveAs } from 'file-saver';

import { GlobalState, GlobalConfigs } from '../../../global.state';


// services
import { UtilityTypesService } from '../../utilities-type/utility-types.service';
import { ConsumptionReportService } from './consumption-report.service';

@Component({
    selector: 'report2',
    templateUrl: './consumption-report.component.html',
    styleUrls: ['./../wo-report.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ConsumptionReportComponent implements OnDestroy {
	// constants
    private readonly DEFAULT_SORT_FIELD = "date";
    private readonly DEFAULT_ITEM_PER_PAGE = "10";
    private readonly _yearRange = GlobalConfigs.yearRange;

    // table related
    private totalRecords = 0;

    // error messages
    private errMsg = [];

    // chart model
    private chartFilterModel = {
        utilityType: null,
        dateFrom: null,
        dateTo: null
    }

    private options = {
        elements: {
            line: {
                tension: 0,
            }
        }
    };

    private chartData;

	// filter model
    private filterModel: { _itemsDateTypes, dateType, dateFrom, dateTo, _itemsUtilityTypes, utilityType } = {
        _itemsDateTypes: [
            { id: 1, text: "Created On", field: "dateCreated" },
            { id: 2, text: "Consumption Date", field: "date" },
        ],
        dateType: null,
        dateFrom: null,
        dateTo: null,
        _itemsUtilityTypes: [{ id: -1, text: "All" }],
		utilityType: []
    };

	// data model
    private lstConsumptions = [];

    // View Childs
    @ViewChild("selectDateType") _lsbSelectDateType: SelectComponent;
    @ViewChild("selectUtilityType") _lsbUtilityType: SelectComponent;
    @ViewChild("pnlFilter") _pnlFilter: Panel;
    @ViewChild("pnlChart") _pnlChart: Panel;
    @ViewChild("chart") chart: UIChart;

    constructor(
        private _utilityTypeService: UtilityTypesService,
        private _consumptionReportService: ConsumptionReportService) {
        this.chartData = {
            labels: [],
            datasets: []
        };
    }

    ngOnInit() {
        // load utility types
        this._utilityTypeService.getUtilities().subscribe(response => {
            if (response.resultCode.code == "0") {
                let __responseData = response.data;
                let __itemsUtilityTypes = [{ id: -1, text: "All" }];
                for (var i = 0; i < __responseData.length; i++) {
                    //this.filterModel._itemsUtilityTypes.push({ id: __responseData[i].utilityTypeId, text: __responseData[i].name });
                    __itemsUtilityTypes.push({ id: __responseData[i].utilityTypeId, text: __responseData[i].name});
                }
                this.filterModel._itemsUtilityTypes = __itemsUtilityTypes;

                //this._lsbUtilityType.active = [{ id: -1, text: "All" }];
            } else {
                // show error message?
                this.errMsg = [];
                this.errMsg.push(response.resultCode.message);
            }
        });
        this._lsbUtilityType.active = [{ id: -1, text: "All" }];
        this.filterModel.utilityType = [{ id: -1, text: "All" }];

        // set default filter
        this._lsbSelectDateType.active = [this.filterModel._itemsDateTypes[1]];
        this.filterModel.dateType = this.filterModel._itemsDateTypes[1];

        var today = new Date();
        this.filterModel.dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filterModel.dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    private refresh(event, dataTable: DataTable) {
        console.log("refresh", event, dataTable, this.filterModel);

        this.errMsg = [];
        if (this.filterModel.dateType == null) {
            this.errMsg.push("Date is required");
            //return;
        }

        if (this.filterModel.dateFrom == null) {
            this.errMsg.push("Date From is required");
            //return;
        }

        if (this.filterModel.dateTo == null) {
            this.errMsg.push("Date To is required");
            //return;
        }

        if (this.filterModel.dateFrom != null && this.filterModel.dateTo != null && this.filterModel.dateFrom > this.filterModel.dateTo) {
            this.errMsg.push("Date From must be earlier than Date To");
            //return;
        }

        if (this.errMsg.length > 0) return;

        this.chartFilterModel.dateFrom = this.filterModel.dateFrom;
        this.chartFilterModel.dateTo = this.filterModel.dateTo;
        this.chartFilterModel.utilityType = this.filterModel.utilityType;
        let paramToSend = {
            filters: {
                dateType: {
                    matchMode: "undefined",
                    value: this.filterModel.dateType == null ? null : this.filterModel.dateType.field
                },
                dateFrom: {
                    matchMode: "undefined",
                    value: this.filterModel.dateFrom == null ? null : moment(this.filterModel.dateFrom).format("YYYY-MM-DD")
                },
                dateTo: {
                    matchMode: "undefined",
                    value: this.filterModel.dateTo == null ? null : moment(this.filterModel.dateTo).format("YYYY-MM-DD")
                },
                utilityType: {
                    matchMode: "undefined",
                    value: this.filterModel.utilityType == null || this.filterModel.utilityType.length == 0 ? -1 : this.filterModel.utilityType[0].id //this.readyFilterUtilityTypeData()
                }
            },
            sortField: dataTable.sortField,
            sortOrder: dataTable.sortOrder,
            first: dataTable.first,
            rows: dataTable.rows
        };

        console.log("paramToSend", paramToSend);

        //this._pnlFilter.collapse(new Event("click"));

        // table
        this._consumptionReportService.getUtilityConsumptionsAsReport(paramToSend).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.lstConsumptions = response.data;
                this.totalRecords = response.paging.total;

                console.log("totalRecords", this.totalRecords, response.paging);
            } else {
                // show error message?
                this.errMsg = [];
                this.errMsg = this.errMsg.concat(response.resultCode.message);
            }
            
        });

        // chart
        this._consumptionReportService.getUtilityConsumptionsAsChart(paramToSend).subscribe(response => {
            if (response.resultCode.code == "0") {
                let tmpChartResponseData = response.data;
                let tmpChartData = {};

                // define all filtered utility type
                if (this.chartFilterModel.utilityType.length == 1 && this.chartFilterModel.utilityType[0].id == -1) {
                    // show all utility types
                    for (let tmpUtilType of this.filterModel._itemsUtilityTypes) {
                        if (tmpUtilType.id != -1) {
                            tmpChartData[tmpUtilType.text] = [];
                        }
                    }
                } else {
                    // show filtered type only
                    for (let tmpUtilType of this.filterModel.utilityType) {
                        tmpChartData[tmpUtilType.text] = [];
                    }
                }

                console.log("datasets", tmpChartData);

                // build chart X-Axis
                //this.chartFilterModel.dateFrom
                let tmpChartXAxis = [];
                // changed to support older date if 'Created On' is selected
                // this may need confirmation first
                let tmpDateFrom: Date = (response.data.length > 0 && new Date(response.data[0].date) < this.chartFilterModel.dateFrom) ? new Date(response.data[0].date) : this.chartFilterModel.dateFrom;
                console.log("tmpDateFrom", tmpDateFrom);
                let tmpLastIndexData = 0;
                do {
                    // generate label for each day
                    let tmpLabel = moment(tmpDateFrom).format("YYYY-MM-DD");
                    tmpChartXAxis.push(tmpLabel);
                    tmpDateFrom = new Date(tmpDateFrom.getFullYear(), tmpDateFrom.getMonth(), tmpDateFrom.getDate() + 1);
                    
                    let hasMatch = false;
                    while (tmpLastIndexData < tmpChartResponseData.length
                        && tmpChartResponseData[tmpLastIndexData].date == tmpLabel) {
                        console.log("match!", tmpLabel);
                        hasMatch = true;
                        tmpChartData[tmpChartResponseData[tmpLastIndexData].utilityType].push(tmpChartResponseData[tmpLastIndexData].nettTotal);
                        tmpLastIndexData++;
                    }

                    if (!hasMatch) {
                        for (let data in tmpChartData) {
                            if (tmpChartData.hasOwnProperty(data)) {
                                tmpChartData[data].push(0);
                            }
                        }
                    } else {
                        // populate highest array length
                        let maxLength = 0;
                        for (let data in tmpChartData) {
                            if (tmpChartData.hasOwnProperty(data)) {
                                if (tmpChartData[data].length > maxLength) {
                                    maxLength = tmpChartData[data].length;
                                }
                            }
                        }

                        // add null for each empty record
                        for (let data in tmpChartData) {
                            if (tmpChartData.hasOwnProperty(data)) {
                                if (tmpChartData[data].length < maxLength) {
                                    for (var i = tmpChartData[data].length; i < maxLength; i++) {
                                        tmpChartData[data].push(0);
                                    }
                                }
                            }
                        }
                    }
                } while (tmpDateFrom <= this.chartFilterModel.dateTo);
                console.log("tmpChartData", tmpChartData);

                // set x-axis label
                this.chartData.labels = tmpChartXAxis;

                // lets build datasets
                let chartColor = ['#4bc0c0', '#565656', '#a6a6a6', '#7836d1', '#52b1e0']
                let tmpDataSets = [];
                var index = 0;
                for (let data in tmpChartData) {
                    if (tmpChartData.hasOwnProperty(data)) {
                        tmpDataSets.push({
                            "label": data,
                            "data": tmpChartData[data],
                            "fill": false,
                            "borderColor": chartColor[index],
                        });
                    }
                    index = (index + 1) % chartColor.length;
                }
                this.chartData.datasets = tmpDataSets;

                // refresh chart
                setTimeout(this.chart.refresh(), 50);

                this._pnlChart.expand(new Event("click"));

            } else {
                // show error message?
                //this.errMsg.push(response.resultCode.message);
                //this.errMsg.push("A server error occured. Please try again later.");
                this.errMsg = [];
                this.errMsg = this.errMsg.concat(response.resultCode.message);
            }
        });
    }

    removeFilterSelectBox(field, event) {
        //console.log("selectFilter", field, event);

        switch (field) {
            case 'dateType': {
                this._lsbSelectDateType.active = [this.filterModel._itemsDateTypes[0]];
                this.filterModel.dateType = [this.filterModel._itemsDateTypes[0]];
                break;
            }
            // BELOW IS FOR MULTIPLE UTILITY TYPE
            //case 'utilityType': {
            //    console.log("removed", this._lsbUtilityType.active);
            //    if (this._lsbUtilityType.active.length == 0) {
            //        this._lsbUtilityType.active.push({id: -1, text: "All"});
            //    }
            //}
            case 'utilityType': {
                this._lsbUtilityType.active = [this.filterModel._itemsUtilityTypes[0]];
                this.filterModel.utilityType = [this.filterModel._itemsUtilityTypes[0]];
                break;
            }
        }
    }

    selectFilterSelectBox(field, event) {
        console.log("selectFilter", field, event);

        switch (field) {
            case 'dateType': {
                for (var i = 0; i < this.filterModel._itemsDateTypes.length; i++) {
                    if (this.filterModel._itemsDateTypes[i].id == event.id) {
                        this.filterModel.dateType = this.filterModel._itemsDateTypes[i];
                    }
                }

                break;
            }
            case 'utilityType': {
                this.filterModel.utilityType = [event];
                break;
            }
            // MULTIPLE UTILITY TYPE
            //case 'utilityType': {
            //    if (event.id == -1) {
            //        // user selected "All"
            //        // then set active item to "All" only
            //        this._lsbUtilityType.active = [event];
            //    } else {
            //        if (this._lsbUtilityType.active.length > 1) {
            //            let __activeItem = this._lsbUtilityType.active.filter(function (item) {
            //                return item.id != -1;
            //            });

            //            this._lsbUtilityType.active = __activeItem;
            //        }
            //    }
            //}
        }
    }

    downloadCSV(dataTable: DataTable) {
        console.log("refresh", event, dataTable, this.filterModel);

        this.errMsg = [];
        if (this.filterModel.dateType == null) {
            this.errMsg.push("Date is required");
            //return;
        }

        if (this.filterModel.dateFrom == null) {
            this.errMsg.push("Date From is required");
            //return;
        }

        if (this.filterModel.dateTo == null) {
            this.errMsg.push("Date To is required");
            //return;
        }

        if (this.filterModel.dateFrom != null && this.filterModel.dateTo != null && this.filterModel.dateFrom > this.filterModel.dateTo) {
            this.errMsg.push("Date From must be earlier than Date To");
            //return;
        }

        if (this.errMsg.length > 0) return;

        this.chartFilterModel.dateFrom = this.filterModel.dateFrom;
        this.chartFilterModel.dateTo = this.filterModel.dateTo;
        let paramToSend = {
            filters: {
                dateType: {
                    matchMode: "undefined",
                    value: this.filterModel.dateType == null ? null : this.filterModel.dateType.field
                },
                dateFrom: {
                    matchMode: "undefined",
                    value: this.filterModel.dateFrom == null ? null : moment(this.filterModel.dateFrom).format("YYYY-MM-DD")
                },
                dateTo: {
                    matchMode: "undefined",
                    value: this.filterModel.dateTo == null ? null : moment(this.filterModel.dateTo).format("YYYY-MM-DD")
                },
                utilityType: {
                    matchMode: "undefined",
                    value: this.filterModel.utilityType == null || this.filterModel.utilityType.length == 0 ? -1 : this.filterModel.utilityType[0].id //this.readyFilterUtilityTypeData()
                }
            },
            sortField: dataTable.sortField,
            sortOrder: dataTable.sortOrder,
            first: dataTable.first,
            rows: dataTable.rows,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        console.log("export CSV");
        this._consumptionReportService.exportUtilityConsumptions(paramToSend).subscribe(response => {
            console.log("export CSV", response);
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            saveAs(blobData, "consumptions.csv");
        });
        console.log("end export csv");
    }

    ngOnDestroy() {

    }
}