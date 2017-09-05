import { Component, ViewChild, ViewContainerRef, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions, DateModel } from 'ng2-datepicker';
import { DataTable, TabViewModule } from "primeng/primeng";

import { SettingsService } from './settings.service';
import { GrowlMessage, MessageLabels, MessageSeverity } from '../../popup-notification';

import { GlobalState, GlobalConfigs } from '../../global.state';

@Component({
    selector: 'settings',
    templateUrl: 'settings.component.html',
    encapsulation: ViewEncapsulation.None
})
export class SettingsComponent {
    private appUrl = GlobalConfigs.APP_BASE_URL;

    // model
    private settingsModel;

    // err message
    private errMsg = [];
    private isLoadingData = true;


    constructor(private _settingsService: SettingsService) {

    }

    ngOnInit() {
        this._settingsService.getAllSettings().subscribe(response => {
            this.isLoadingData = false;
            if (response.resultCode.code == "0") {
                this.settingsModel = response.data;
            } else {
                this.errMsg = [response.resultCode.message];
            }
        });
    }

    onSubmit() {
        console.log(this.settingsModel);

        this.isLoadingData = true;
        this._settingsService.updateSettings(this.settingsModel).subscribe(response => {
            this.isLoadingData = false;
            if (response.resultCode.code == "0") {
                GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
            } else {
                this.errMsg = [response.resultCode.message];
                GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.SAVE_ERROR);
            }
        });
    }
}