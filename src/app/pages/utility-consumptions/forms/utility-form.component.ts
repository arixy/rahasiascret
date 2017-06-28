import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, FormControl } from '@angular/forms';
//import { EntityService } from './entity.service';
import { ModalDirective } from 'ng2-bootstrap';
import { DatePickerOptions } from 'ng2-datepicker';
import { SelectComponent, SelectItem } from 'ng2-select';

// global configs
import { GlobalConfigs } from '../../../global.state';

// validators
import { CustomValidators } from './custom-validators';

// services
import { UtilityConsumptionsService } from '../utility-consumptions.service';
import { UOMService } from '../../../services/uom.service';
import { UtilityTypeService } from '../../../services/utility-type.service';

@Component({
    selector: 'utility-form',
    templateUrl: './utility-form.component.html',
    providers: [UOMService, UtilityTypeService]
})
export class UtilityFormComponent {
    private formMode: string = "NEW" // one of these: NEW, VIEW, EDIT

    // existing data sent from parent component
    public utilityModel;

    // form group
    public formGroup: FormGroup;

    // form fields
    private txtUtilityId;
    private lsbUtilityType;
    private lsbUOM;
    private dtbDate;
    private txtValue;
    private txtDescription;

    // exclusions
    private lstExclusions;
    private lstDeletedExclusions;

    // select box by directives
    @ViewChild("utilityTypesSelectBox") utilityTypesSelectBox: SelectComponent;
    @ViewChild("uomSelectBox") uomSelectBox: SelectComponent;

    // dropdown items
    private _itemsUtilityTypes;
    private _itemsUOM;

    // others
    private _yearRange = GlobalConfigs.yearRange;

    constructor(
        public fb: FormBuilder,
        public cdr: ChangeDetectorRef,
        private _utilityConsumptionService: UtilityConsumptionsService,
        private _utilityTypeService: UtilityTypeService,
        private _uomService: UOMService) {

    }

    ngOnInit() {

        this.formGroup = this.fb.group({
            'txtUtilityId': ['', null],
            'lsbUtilityType': ['', Validators.compose([Validators.required])],
            'lsbUOM': ['', Validators.compose([Validators.required])],
            'dtbDate': ['', Validators.compose([Validators.required])],
            'txtValue': ['', Validators.compose([Validators.required, Validators.pattern("[0-9]+\.[0-9]+")])],
            'txtDescription': ['', null],
            'exclusions': this.fb.group({

            })
        });

        this.txtUtilityId = this.formGroup.controls['txtUtilityId'];
        this.lsbUtilityType = this.formGroup.controls['lsbUtilityType'];
        this.lsbUOM = this.formGroup.controls['lsbUOM'];
        this.dtbDate = this.formGroup.controls['dtbDate'];
        this.txtValue = this.formGroup.controls['txtValue'];
        this.txtDescription = this.formGroup.controls['txtDescription'];

        // default permissions
        this.txtUtilityId.disable();

        // if formMode is VIEW
        if (this.formMode == "VIEW") {
            this.formGroup.disable();

            // futhermore, disable all exclusion tab items
        }

        this._utilityTypeService.getAllUtilityTypes().subscribe(response => {
            console.log("/utility-type/all", response);
            if (response.resultCode.code == "0") {
                let __lstUtilityTypes = response.data;

                this._itemsUtilityTypes = [];
                for (var i = 0; i < __lstUtilityTypes.length; i++) {
                    this._itemsUtilityTypes.push({ id: __lstUtilityTypes[i].utilityTypeId, text: __lstUtilityTypes[i].name });
                }
            } else {
                // show error message?
            }
        });

        this._uomService.getAllUtilityUOM().subscribe(response => {
            console.log("/utility-uom/all", response);
            if (response.resultCode.code == "0") {
                let __lstUOM = response.data;

                this._itemsUOM = [];
                for (var i = 0; i < __lstUOM.length; i++) {
                    this._itemsUOM.push({ id: __lstUOM[i].utilityUomId, text: __lstUOM[i].name });
                }
            } else {
                // show error message?
            }
        });

        // load data
        if (this.formMode != "NEW") {
            this._utilityConsumptionService.getUtilityConsumptionById(this.utilityModel.utilityConsumptionId).subscribe(response => {
                if (response.resultCode.code == "0") {
                    this.formGroup.patchValue({
                        'txtUtilityId': response.data.utilityConsumptionId,
                        'dtbDate': new Date(response.data.date),
                        'txtDescription': response.data.description,
                        'txtValue': response.data.value
                    });

                    this._utilityTypeService.getAllUtilityTypeById(response.data.utilityTypeId).subscribe(response => {
                        console.log("/utility-type/get", response);
                        if (response.resultCode.code == "0") {
                            this.formGroup.patchValue({
                                'lsbUtilityType': { id: response.data.utilityTypeId, text: response.data.name }
                            });
                            this.utilityTypesSelectBox.active = [{ id: response.data.utilityTypeId, text: response.data.name }];
                        } else {
                            // show error message?
                        }
                    });

                    this._uomService.getUtilityUOMById(response.data.utilityUomId).subscribe(response => {
                        console.log("/utility-uom/get", response);
                        if (response.resultCode.code == "0") {
                            this.formGroup.patchValue({
                                'lsbUOM': { id: response.data.utilityUomId, text: response.data.name }
                            });
                            this.uomSelectBox.active = [{ id: response.data.utilityUomId, text: response.data.name }];
                        } else {
                            // show error message?
                        }
                    });

                    this.lstExclusions = response.data.utilityConsumptionExclusions;
                } else {
                    // show error message?
                }
            });
        }
    }

    touchSelectBox(field, event) {
        console.log("touchSelectBox", field, event);
        switch (field) {
            case 'lsbUtilityType': this.lsbUtilityType.markAsTouched(); break;
            case 'lsbUOM': this.lsbUOM.markAsTouched(); break;
        }
    }

    removeSelectBoxValue(field, event) {
        console.log("removeSelectBoxValue", field, event);

        // handle every possible field here
        switch (field) {
            case 'lsbUtilityType': this.lsbUtilityType.setValue(null); break;
            case 'lsbUOM': this.lsbUOM.setValue(null); break;
        }
    }

    selectedSelectBoxValue(field, event) {
        console.log("selectedSelectBoxValue", field, event);

        // handle every possible field here
        switch (field) {
            case 'lsbUtilityType': this.lsbUtilityType.setValue(event); break;
            case 'lsbUOM': this.lsbUOM.setValue(event); break;
        }
    }

    // #Region Exclusion
    addExclusion() {
        if (this.lstExclusions == null) {
            this.lstExclusions = new Array();
        }
        this.lstExclusions.push({ utilityConsumptionExclusionId: null, value: null, description: null });
    }

    markAsTouched(exclusion, field) {
        exclusion[field] = true;
    }

    hasValueError(exclusion) {
        if (exclusion.value == null || exclusion.value == "") {
            return { required: true };
        } else if (!(/^[0-9]+(\.[0-9]+)?$/).test(exclusion.value)) {
            return { nonnumber: true };
        }

        return {};
    }

    hasDescriptionError(exclusion) {
        if (exclusion.description == null || exclusion.description == "") {
            return { required: true };
        }

        return {};
    }

    removeExclusion(exclusion) {
        console.log("remove exclusion", exclusion);
        if (this.lstDeletedExclusions == null) {
            this.lstDeletedExclusions = new Array();
        }

        let exclusionFiltered = this.lstExclusions.filter(function (ex) {
            console.log("testing filter");

            return ex != exclusion;
        });

        this.lstExclusions = exclusionFiltered;

        if (exclusion.utilityConsumptionExclusionId != null) {
            this.lstDeletedExclusions.push(exclusion.utilityConsumptionExclusionId);
        }
    }

    isExclusionValid() {
        if (this.lstExclusions != null) {
            for (var i = 0; i < this.lstExclusions.length; i++) {
                if (this.hasValueError(this.lstExclusions[i])['required'] || this.hasValueError(this.lstExclusions[i])['nonnumber']) {
                    return false;
                }

                if (this.hasDescriptionError(this.lstExclusions[i])['required']) {
                    return false;
                }
            }
        }

        return true;
    }
    // #EndRegion

    onSubmit(formValues) {
        if (this.formGroup.valid) {
            console.log("utility-form is valid");

            let utilityConsumptionObject = {
                utilityConsumptionId: this.formMode == "NEW" ? null : this.utilityModel.utilityConsumptionId,
                utilityTypeId: this.lsbUtilityType.value.id,
                date: this.dtbDate.value,
                description: this.txtDescription.value,
                value: this.txtValue.value,
                utilityUomId: this.lsbUOM.value.id,
                utilityConsumptionExclusions: this.lstExclusions == null ? [] : this.lstExclusions,
                deletedUtilityConsumptionExclusions: this.lstDeletedExclusions
            };

            console.log("object to send: ", utilityConsumptionObject);

            if (this.formMode == "NEW") {
                this._utilityConsumptionService.addUtilityConsumption(utilityConsumptionObject).subscribe(response => {
                    if (response.resultCode.code == "0") {
                        this._utilityConsumptionService.announceEvent("utilityConsumptions_btnSaveOnSuccess");
                    } else {
                        // show error message?
                    }
                });
            } else {
                this._utilityConsumptionService.updateUtilityConsumption(utilityConsumptionObject).subscribe(response => {
                    console.log("update", response);
                    if (response.resultCode.code == "0") {
                        this._utilityConsumptionService.announceEvent("utilityConsumptions_btnSaveOnSuccess");
                    } else {
                        console.log("error?");
                        // show error message?
                    }
                });
            }
        }

        return false;
    }

    onCancel() {
        this._utilityConsumptionService.announceEvent("utilityConsumptions_btnCancelOnClick");
    }
}