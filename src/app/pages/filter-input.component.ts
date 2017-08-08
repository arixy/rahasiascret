import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DataTable } from 'primeng/primeng';

@Component({
    selector: 'sortable-filter-input',
    templateUrl: 'filter-input.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class FilterInputComponent {
    @Input('field')
    private fieldName;

    @Input('header')
    private header;

    @Input('disabled')
    private disabled = false;

    @Input('dataTable')
    private dt;

    @Output('onFilter')
    private onFilter = new EventEmitter<any>();

    private formControl = new FormControl();

    constructor() {

    }

    ngOnInit() {
        this.formControl.valueChanges.debounceTime(800).subscribe(input => {
            let filter: any = {};
            filter["field"] = this.fieldName;
            filter["value"] = {
                matchMode: undefined,
                value: input
            };
            this.onFilter.emit(filter);
        });
    }

    public resetFilter() {
        this.formControl.patchValue("", { onlySelf: true, emitEvent: false });
    }

}