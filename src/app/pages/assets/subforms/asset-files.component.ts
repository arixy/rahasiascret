import { Component, Input, Output, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions } from 'ng2-datepicker';
import { SelectComponent, SelectItem } from 'ng2-select';

import { AssetService } from '../../../services/asset.service';
//import { LocationService } from '../../../services/location.service';
//import { AssetService } from '../../../services/asset.service';
//import { UsersService } from '../../users/users.service';
//import { RoleService } from '../../role/role.service';

import { saveAs } from 'file-saver';

import { WorkflowActions, WorkOrderStatuses } from '../../../../global.state';

@Component({
    selector: 'asset-files',
    templateUrl: './asset-files.component.html',
    providers: [AssetService]
})
export class AssetFilesComponent {
    @Input('existingFiles')
    @Output('existingFiles')
    private existingFiles;

    @Input('existingPhotos')
    @Output('existingPhotos')
    private existingPhotos;

    @Input('newlyAddedFiles')
    @Output('newlyAddedFiles')
    private newlyAddedFiles;

    @Input('actionType')
    private actionType;

    @Input('selectedWO')
    private selectedWO;

    @Input('selectedWoType')
    private selectedWoType;

    @Input('isCanEdit')
    private isCanEdit = true;

    constructor(private _taskService: AssetService) {
        
    }

    ngOnInit() {
        if (this.newlyAddedFiles == null) this.newlyAddedFiles = [];
        if (this.existingFiles == null) this.existingFiles = [];
        if (this.existingPhotos == null) this.existingPhotos = [];
    }

    filterActiveFiles(file) {
        return file.isActive;
    }

    filterDeletedFiles(file) {
        return !file.isActive;
    }

    getFilesFiltered() {
        if (this.existingFiles == null) this.existingFiles = [];
        return this.existingFiles.filter(this.filterActiveFiles);
    }

    getPhotosFiltered() {
        if (this.existingPhotos == null) this.existingPhotos = [];
        return this.existingPhotos.filter(this.filterActiveFiles);
    }

    removeFile(file) {
        file.isActive = false;
    }

    onSelectFile(event) {
        console.log(event);
        for (var i = 0; i < event.files.length; i++) {
            var file = event.files[i];
            if (file.type.includes("image")) {
                var tmpPhoto = {
                    assetPhotoId: null,
                    name: file.name,
                    path: "", // image blob url is stored in 'file.objectURL.changingThisBreaksApplicationSecurity'
                    notes: "",
                    isActive: true,
                    actualFile: file
                };
                this.existingPhotos.unshift(tmpPhoto);
            } 
            
        }
    }

    downloadPhoto(file) {
        this._taskService.getImageById(file.assetPhotoId).subscribe((response) => {
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            var reader = new FileReader();
            reader.onload = function (e) {
                window.open(reader.result);
            }
            reader.readAsDataURL(blobData);
        });
    }

    /*downloadFile(file) {
        this._taskService.getFileById(file.workOrderFileId).subscribe((response) => {
            let blobData: Blob = new Blob([response.blob()], { type: response.headers.get('Content-Type') });
            //var reader = new FileReader();
            //reader.onload = function (e) {
            //    window.open(reader.result);
            //}
            //reader.readAsDataURL(blobData);
            saveAs(blobData, file.name);
        });
    }*/

    markAsTouched(marker, field: string) {
        console.log("markAsTouched", marker, field);
        switch (field) {
            case 'noteTouched': marker.noteTouched = true; break;
        }
    }
}