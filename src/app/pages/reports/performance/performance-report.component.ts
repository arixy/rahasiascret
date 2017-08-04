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
import { WorkOrderTypeService } from '../../../services/wo-type.service';
import { WorkOrderService } from '../../../services/work-order.service';
import { UsersService } from '../../users/users.service';
import { PerformanceReportService } from './performance-report.service';

@Component({
    selector: 'report3',
    templateUrl: './performance-report.component.html',
    styleUrls: ['../wo-report.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PerformanceReportComponent implements OnDestroy {
	// constants
    private readonly DEFAULT_SORT_FIELD = "dateUpdated";
    private readonly DEFAULT_ITEM_PER_PAGE = GlobalConfigs.DEFAULT_ITEM_PER_PAGE;
    private readonly _yearRange = GlobalConfigs.yearRange;

    private totalRecords = 0;

    private errMsg = [];

	// filter model
    private filterModel: { _itemsDateTypes, dateType, dateFrom, dateTo, _itemsWOTypes, woType, _itemsWOCategories, woCategory, _itemsPIC, pic } = {
        _itemsDateTypes: [
            { id: 1, text: "Created On", field: "dateCreated" },
            { id: 2, text: "Completed On", field: "completeDateTime" },
            { id: 3, text: "Start On", field: "startDate" },
            { id: 4, text: "Due On", field: "dueDate" }
        ],
        dateType: null,
        dateFrom: null,
        dateTo: null,
        _itemsWOTypes: [],
        woType: [{ id: -1, text: "All" }],
        _itemsWOCategories: [],
        woCategory: [{ id: -1, text: "All" }],
        _itemsPIC: [],
        pic: [{id: -1, text: "All"}]
    };

	// data model
    private lstPerformances = [];

    // View Childs
    @ViewChild("selectDateType") _lsbSelectDateType: SelectComponent;
    @ViewChild("selectWOType") _lsbSelectWOType: SelectComponent;
    @ViewChild("selectPIC") _lsbSelectPIC: SelectComponent; 
    @ViewChild("selectWOCategory") _lsbSelectWOCategory: SelectComponent;
    @ViewChild("pnlFilter") _pnlFilter: Panel;

    constructor(
        private _woTypeService: WorkOrderTypeService,
        private _performanceReportService: PerformanceReportService,
        private _woCategoryService: WorkOrderService,
        private _userService: UsersService
    ) {

    }

    ngOnInit() {
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
                this.errMsg = this.errMsg.concat(response.resultCode.message);
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
                this.errMsg = this.errMsg.concat(response.resultCode.message);
            }
        });

        // get list of PIC
        this._userService.getAssigneeByTypeId("User", 1).subscribe(response => {
            if (response.resultCode.code == "0") {
                let __responseData = response.data;
                let __users = [{ id: -1, text: "All" }];

                for (var i = 0; i < __responseData.length; i++) {
                    __users.push({ id: __responseData[i].userId, text: __responseData[i].fullname });
                }
                this.filterModel._itemsPIC = __users;
            } else {
                this.errMsg = this.errMsg.concat(response.resultCode.message);
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
                woType: {
                    matchMode: "undefined",
                    value: this.filterModel.woType == null || this.filterModel.woType.length == 0 ? -1 : this.filterModel.woType[0].id
                },
                woCategory: {
                    matchMode: "undefined",
                    value: this.filterModel.woCategory == null || this.filterModel.woCategory.length == 0 ? -1 : this.filterModel.woCategory[0].id
                },
                pic: {
                    matchMode: "undefined",
                    value: this.filterModel.pic == null || this.filterModel.pic.length == 0 ? - 1 : this.filterModel.pic[0].id
                }
            },
            sortField: dataTable.sortField,
            sortOrder: dataTable.sortOrder,
            first: dataTable.first,
            rows: dataTable.rows
        };

        console.log("paramToSend", paramToSend);

        // request API
        this._performanceReportService.getPerformancesAsReport(paramToSend).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.lstPerformances = response.data;
                this.totalRecords = response.paging.total;
            } else {
                this.errMsg = this.errMsg.concat(response.resultCode.message);
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
            case 'pic': {
                this._lsbSelectPIC.active = [this.filterModel._itemsPIC[0]];
                this.filterModel.pic = [this.filterModel._itemsPIC[0]];
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
            case 'woType': {
                this.filterModel.woType = [event];
                break;
            }
            case 'woCategory': {
                this.filterModel.woCategory = [event];
                break;
            }
            case 'pic': {
                this.filterModel.pic = [event];
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
                woType: {
                    matchMode: "undefined",
                    value: this.filterModel.woType == null || this.filterModel.woType.length == 0 ? -1 : this.filterModel.woType[0].id
                },
                woCategory: {
                    matchMode: "undefined",
                    value: this.filterModel.woCategory == null || this.filterModel.woCategory.length == 0 ? -1 : this.filterModel.woCategory[0].id
                },
                pic: {
                    matchMode: "undefined",
                    value: this.filterModel.pic == null || this.filterModel.pic.length == 0 ? - 1 : this.filterModel.pic[0].id
                }
            },
            sortField: dataTable.sortField,
            sortOrder: dataTable.sortOrder,
            first: dataTable.first,
            rows: dataTable.rows
        };

        console.log("export CSV");
        this._performanceReportService.exportPerformanceReport(paramToSend).subscribe(response => {
            console.log("export CSV", response);
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            saveAs(blobData, "performance.csv");
        });
        console.log("end export csv");
    }

    ngOnDestroy() {

    }
}