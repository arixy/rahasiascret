import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnDestroy, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import { SelectComponent, SelectItem } from 'ng2-select';
import * as moment from 'moment';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import { DataTable, TabViewModule, Panel } from "primeng/primeng";
import { saveAs } from 'file-saver';

// global
import { GlobalState, GlobalConfigs } from '../../../global.state';

// services
import { StatusService } from '../../../services/status.service';
import { WorkOrderTypeService } from '../../../services/wo-type.service';
import { WorkOrderReportService } from './wo-report.service';
import { WorkOrderService } from '../../../services/work-order.service';

@Component({
    selector: 'report1',
    templateUrl: './wo-report.component.html',
    styleUrls: ['../wo-report.css'],
    encapsulation: ViewEncapsulation.None
})
export class WorkOrderListReportComponent implements OnDestroy {
	// constants
    private readonly DEFAULT_SORT_FIELD = "lastUpdated";
    private readonly DEFAULT_ITEM_PER_PAGE = "10";

    private readonly _yearRange = GlobalConfigs.yearRange;

    private totalRecords = 0;
    private errMsg = [];

	// filter model
    private filterModel: { _itemsDateTypes, dateType, dateFrom, dateTo, _itemsStatuses, status, _itemsWOTypes, woType, _itemsWOCategories, woCategory } = {
        _itemsDateTypes: [
            { id: 1, text: "Created On", field: "dateCreated" },
            { id: 2, text: "Completed On", field: "completedDate" },
            { id: 3, text: "Start On", field: "startDate" },
            { id: 4, text: "Due On", field: "dueDate" }
        ],
        dateType: null,
        dateFrom: null,
        dateTo: null,
		_itemsStatuses: [],
        status: null,
        _itemsWOTypes: [],
        woType: null,
        _itemsWOCategories: [],
        woCategory: null
    };

	// data model
    private lstWorkOrders = [];
    //private lstWorkOrders = [{
    //    woNumber: "WO1707000001",
    //    woCategoryName: "Customer Complaints",
    //    woPriorityName: "High",
    //    assetName: "Air Conditioner",
    //    locationName: "L3 West Wing",
    //    start: "2017-07-04 13:00",
    //    dueDate: "2017-07-05",
    //    currentStatusName: "In Progress",
    //    assignee: "Hadi",
    //    lastUpdated: "2017-07-04 13:00",
    //    completedDate: null,
    //    onTime: null,
    //    totalHours: null,
    //    totalExpenses: null
    //}, {
    //    woNumber: "WO1707000002",
    //    woCategoryName: "Customer Complaints",
    //    woPriorityName: "High",
    //    assetName: "Escalator",
    //    locationName: "L2 Central Area",
    //    start: "2017-07-04 15:40",
    //    dueDate: "2017-07-06",
    //    currentStatusName: "In Progress",
    //    assignee: "Ari",
    //    lastUpdated: "2017-07-04 15:54",
    //    completedDate: null,
    //    onTime: null,
    //    totalHours: null,
    //    totalExpenses: null
    //    }];

    // View Childs
    @ViewChild("selectDateType") _lsbSelectDateType: SelectComponent;
    @ViewChild("selectStatus") _lsbSelectStatus: SelectComponent;
    @ViewChild("selectWOType") _lsbSelectWOType: SelectComponent;
    @ViewChild("selectWOCategory") _lsbSelectWOCategory: SelectComponent;
    @ViewChild("pnlFilter") _pnlFilter: Panel;

    constructor(private _statusService: StatusService,
        private _woTypeService: WorkOrderTypeService,
        private _workOrderReportService: WorkOrderReportService,
        private _woCategoryService: WorkOrderService
    ) {

    }

    ngOnInit() {
        this._statusService.getWorkOrderStatuses().subscribe(response => {
            if (response.resultCode.code == "0") {
                let __responseData = response.data;
                let __itemStatuses = [{id: -1, text: "All"}];
                for (var i = 0; i < __responseData.length; i++) {
                    __itemStatuses.push({ id: __responseData[i].woStatusId, text: __responseData[i].name });
                }
                this.filterModel._itemsStatuses = __itemStatuses;

                // set default filter status
                this._lsbSelectStatus.active = [__itemStatuses[0]];
                this.filterModel.status = [__itemStatuses[0]];
            } else {
                this.errMsg = [response.resultCode.message];
            }
        });

        // set default filter
        this._lsbSelectWOCategory.active = [{ id: -1, text: "All" }];
        this.filterModel.woCategory = [{ id: -1, text: "All" }];
        this._woCategoryService.getWOs().subscribe(response => {
            if (response.resultCode.code == "0") {
                let __responseData = response.data;
                let __itemCategories = [{ id: -1, text: "All" }];
                for (var i = 0; i < __responseData.length; i++) {
                    __itemCategories.push({ id: __responseData[i].woCategoryId, text: __responseData[i].name });
                }
                this.filterModel._itemsWOCategories = __itemCategories;
            } else {
                this.errMsg = [response.resultCode.message];
            }
        });

        this._woTypeService.getAllWorkOrderTypes().subscribe(response => {
            if (response.resultCode.code == "0") {
                let __responseData = response.data;
                let __woTypes = [{ id: -1, text: "All" }];
                for (var i = 0; i < __responseData.length; i++) {
                    __woTypes.push({ id: __responseData[i].woTypeId, text: __responseData[i].name });
                }
                this.filterModel._itemsWOTypes = __woTypes;

                // set default filter work order type
                this._lsbSelectWOType.active = [__woTypes[0]];
                this.filterModel.woType = [__woTypes[0]];
            } else {
                this.errMsg = [response.resultCode.message];
            }
        });

        // set default filter
        this._lsbSelectDateType.active = [{ id: 1, text: "Created On" }];
        this.filterModel.dateType = { id: 1, text: "Created On", field: "dateCreated" };

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
                status: {
                    matchMode: "undefined",
                    value: this.filterModel.status == null || this.filterModel.status.length == 0 ? -1 : this.filterModel.status[0].id
                },
                woType: {
                    matchMode: "undefined",
                    value: this.filterModel.woType == null || this.filterModel.woType.length == 0 ? -1 : this.filterModel.woType[0].id
                },
                woCategory: {
                    matchMode: "undefined",
                    value: this.filterModel.woCategory == null || this.filterModel.woCategory.length == 0 ? -1 : this.filterModel.woCategory[0].id
                }
            },
            sortField: dataTable.sortField,
            sortOrder: dataTable.sortOrder,
            first: dataTable.first,
            rows: dataTable.rows
        };

        console.log("paramToSend", paramToSend);

        // table
        this._workOrderReportService.getWorkOrdersAsReport(paramToSend).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.lstWorkOrders = response.data;
                this.totalRecords = response.paging.total;
            } else {
                // show error message?
                this.errMsg.push(response.resultCode.message);
            }

        });

        //this._pnlFilter.collapse(new Event("click"));
    }

    removeFilterSelectBox(field, event) {
        //console.log("selectFilter", field, event);

        switch (field) {
            case 'dateType': {
                this._lsbSelectDateType.active = [this.filterModel._itemsDateTypes[0]];
                this.filterModel.dateType = [this.filterModel._itemsDateTypes[0]];
                break;
            }
            case 'status': {
                this._lsbSelectStatus.active = [this.filterModel._itemsStatuses[0]];
                this.filterModel.status = [this.filterModel._itemsStatuses[0]];
                break;
            }
            case 'woType': {
                this._lsbSelectWOType.active = [this.filterModel._itemsWOTypes[0]];
                this.filterModel.woType = [this.filterModel._itemsWOTypes[0]];
                break;
            }
            case 'woCategory': {
                this._lsbSelectWOCategory.active = [this.filterModel._itemsWOCategories[0]];
                this.filterModel.woCategory = [this.filterModel._itemsWOCategories[0]];
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
            case 'status': {
                this.filterModel.status = this._lsbSelectStatus.active;
                break;
            }
            case 'woType': {
                this.filterModel.woType = this._lsbSelectWOType.active;
                break;
            }
            case 'woCategory': {
                this.filterModel.woCategory = this._lsbSelectWOCategory.active;
                break;
            }
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
                status: {
                    matchMode: "undefined",
                    value: this.filterModel.status == null || this.filterModel.status.length == 0 ? -1 : this.filterModel.status[0].id
                },
                woType: {
                    matchMode: "undefined",
                    value: this.filterModel.woType == null || this.filterModel.woType.length == 0 ? -1 : this.filterModel.woType[0].id
                },
                woCategory: {
                    matchMode: "undefined",
                    value: this.filterModel.woCategory == null || this.filterModel.woCategory.length == 0 ? -1 : this.filterModel.woCategory[0].id
                }
            },
            sortField: dataTable.sortField,
            sortOrder: dataTable.sortOrder,
            first: dataTable.first,
            rows: dataTable.rows
        };

        console.log("export CSV");
        this._workOrderReportService.exportWorkOrderReport(paramToSend).subscribe(response => {
            console.log("export CSV", response);
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            saveAs(blobData, "work_order.csv");
        });
        console.log("end export csv");
    }

    ngOnDestroy() {

    }
}