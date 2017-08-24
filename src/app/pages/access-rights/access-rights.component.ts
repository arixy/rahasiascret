import { Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnDestroy, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective,  } from 'ng2-bootstrap';
import * as moment from 'moment';
import { GlobalState } from '../../global.state';
import { SelectComponent, SelectItem } from 'ng2-select';

import { DataTable, TabViewModule } from "primeng/primeng";

import { RoleService } from "../role/role.service";
import { AccessRightsService } from "./access-rights.service";

@Component({
    selector: 'access-rights',
    templateUrl: './access-rights.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AccessRightsComponent implements OnDestroy {
    // Subscription object
    private subscription;

    // model
    private roleAuthorizations;
    private lstMenus;

    // has changes flags
    private hasChanges = false;
    private prevSelectedRole;

    private visibleColumn = {
        allowView: true,
        allowAdd: false,
        allowUpdate: false,
        allowDelete: false
    }
    // dropdown items
    private _itemsRoleGroup = null;

    // confirmation modal related
    private _confirmClickedButton = null;

    // error message from server
    private errMsg = [];

    // save button
    private isSaving = false;
    private btnSaveLabel = "Save";

    // loading flag
    private isLoadingData = true;

    @ViewChild("roleGroupSelectBox") roleGroupSelectBox: SelectComponent;
    @ViewChild("confirmModal") viewConfirmModal: ModalDirective;
    @ViewChild("infoModal") viewInfoModal: ModalDirective;

    constructor(
        private _accessRightService: AccessRightsService,
        private _roleService: RoleService
    ) {
        this.roleAuthorizations = null;
    }

    ngOnInit() {
        this._roleService.getRole().subscribe(response => {
            if (response.resultCode.code == "0") {
                this._itemsRoleGroup = [];

                let responseData = response.data;
                if (responseData != null) {
                    for (var i = 0; i < responseData.length; i++) {
                        this._itemsRoleGroup.push({ id: responseData[i].roleId, text: responseData[i].name });
                    }

                    this.roleGroupSelectBox.disabled = false;
                }
            } else {
                // show error message?
            }

            this.isLoadingData = false;
        });
    }

    setHasChanges(hasChanges: boolean) {
        this.hasChanges = hasChanges;
    }

    removeSelectBoxValue(field, event) {
        console.log("clear role select box");
    }

    selectedSelectBoxValue(field, event) {
        console.log("previous role - new role", this.prevSelectedRole, event);
        if (this.prevSelectedRole != null && this.prevSelectedRole.id == event.id) return;

        if (this.hasChanges) {
            console.log("has changes");
            this.viewConfirmModal.show();
            //switch (field) {
            //    case 'lsbRoleGroup': {
            //        this.roleGroupSelectBox.active = [{ id: 3, text: 'Role Group #3' }];
            //    }
            //}
        } else {
            // set previous selected role as current selected role
            this.prevSelectedRole = event;

            this.roleAuthorizations = [];
            this.isLoadingData = true;
            this._accessRightService.getAllMenus().subscribe(response => {
                if (response.resultCode.code == "0") {
                    this.lstMenus = response.data;

                    if (this.lstMenus != null && this.lstMenus.length > 0) {
                        // load existing authorization if any menu is loaded
                        this._accessRightService.getAuthorizationsByRoleId(event.id).subscribe(response => {
                            console.log("lstMenus", this.lstMenus);
                            if (response.resultCode.code == "0") { 
                                let responseData = response.data;

                                for (var i = 0; i < this.lstMenus.length; i++) {
                                    // create menu obj
                                    let objMenuAuth = {
                                        menuId: this.lstMenus[i].menuId,
                                        menuName: this.lstMenus[i].name,
                                        allowAccessOrView: false,
                                        allowAdd: false,
                                        allowUpdate: false,
                                        allowDelete: false,
                                        accessCheckable: this.lstMenus[i].isAllowAccessOrView,
                                        addChechkable: this.lstMenus[i].isAllowAdd,
                                        updateCheckable: this.lstMenus[i].isAllowUpdate,
                                        deleteCheckable: this.lstMenus[i].isAllowDelete
                                    };

                                    this.visibleColumn.allowView = this.visibleColumn.allowView || objMenuAuth.accessCheckable;
                                    this.visibleColumn.allowAdd = this.visibleColumn.allowAdd || objMenuAuth.addChechkable;
                                    this.visibleColumn.allowUpdate = this.visibleColumn.allowUpdate || objMenuAuth.updateCheckable;
                                    this.visibleColumn.allowDelete = this.visibleColumn.allowDelete || objMenuAuth.deleteCheckable;
                                    for (var j = 0; j < responseData.length; j++) {
                                        if (objMenuAuth.menuId == responseData[j].menuId) {
                                            objMenuAuth.allowAccessOrView = responseData[j].allowAccessOrView;
                                            objMenuAuth.allowAdd = responseData[j].allowAdd;
                                            objMenuAuth.allowUpdate = responseData[j].allowUpdate;
                                            objMenuAuth.allowDelete = responseData[j].allowDelete;
                                            break;
                                        }
                                    }

                                    this.roleAuthorizations.push(objMenuAuth);
                                }
                            } else {
                                // show error message?
                                this.errMsg = [];
                                this.errMsg = this.errMsg.concat(response.resultCode.message);
                            }

                            this.isLoadingData = false;
                        });
                    }
                } else {
                    // show error message?
                    this.errMsg = [];
                    this.errMsg = this.errMsg.concat(response.resultCode.message);
                    this.isLoadingData = false;
                }
            });
        }
    }

    onSubmit() {
        console.log("onSubmit", this.roleAuthorizations);
        this.btnSaveLabel = "Saving";
        this.isSaving = true;

        let objRoleAuth = {
            roleId: this.roleGroupSelectBox.active[0].id,
            accessRights: []
        };

        for (var i = 0; i < this.roleAuthorizations.length; i++) {
            if (this.roleAuthorizations[i].allowAccessOrView || this.roleAuthorizations[i].allowAdd || this.roleAuthorizations[i].allowUpdate || this.roleAuthorizations[i].allowDelete) {
                objRoleAuth.accessRights.push(this.roleAuthorizations[i]);
            }
        }

        console.log("objRoleAuth to send", objRoleAuth);
        this.isLoadingData = true;
        this._accessRightService.insertTruncRoleAuthorizations(objRoleAuth).subscribe(response => {
            if (response.resultCode.code == "0") {
                // reset flags
                this.hasChanges = false;
                this.isSaving = false;

                this.btnSaveLabel = "Save";

                //this.viewInfoModal.show();
            } else {
                // show error message?
                this.errMsg = [];
                this.errMsg = this.errMsg.concat(response.resultCode.message);
            }
            this.isLoadingData = false;
        });
    }

    // #Region Unsaved Data Confirmation Modal
    hideModal() {
        if (this._confirmClickedButton == null || this._confirmClickedButton == "No") {
            this.roleGroupSelectBox.active = [this.prevSelectedRole];
        }
    }

    cancelChangeRole() {
        this._confirmClickedButton = "No";
        this.viewConfirmModal.hide();
    }

    proceedChangeRole() {
        this.hasChanges = false;
        this.prevSelectedRole = this.roleGroupSelectBox.active[0];

        this._confirmClickedButton = "Yes";
        this.viewConfirmModal.hide();

        this.roleAuthorizations = [];
        this.isLoadingData = true;
        this._accessRightService.getAllMenus().subscribe(response => {
            if (response.resultCode.code == "0") {
                this.lstMenus = response.data;

                if (this.lstMenus != null && this.lstMenus.length > 0) {
                    // load existing authorization if any menu is loaded
                    this._accessRightService.getAuthorizationsByRoleId(this.roleGroupSelectBox.active[0].id).subscribe(response => {
                        console.log("lstMenus", this.lstMenus);
                        if (response.resultCode.code == "0") {
                            let responseData = response.data;

                            for (var i = 0; i < this.lstMenus.length; i++) {
                                // create menu obj
                                let objMenuAuth = {
                                    menuId: this.lstMenus[i].menuId,
                                    menuName: this.lstMenus[i].name,
                                    allowAccessOrView: false,
                                    allowAdd: false,
                                    allowUpdate: false,
                                    allowDelete: false
                                };

                                for (var j = 0; j < responseData.length; j++) {
                                    if (objMenuAuth.menuId == responseData[j].menuId) {
                                        objMenuAuth.allowAccessOrView = responseData[j].allowAccessOrView;
                                        objMenuAuth.allowAdd = responseData[j].allowAdd;
                                        objMenuAuth.allowUpdate = responseData[j].allowUpdate;
                                        objMenuAuth.allowDelete = responseData[j].allowDelete;
                                        break;
                                    }
                                }

                                this.roleAuthorizations.push(objMenuAuth);
                            }
                        } else {
                            // show error message?
                            this.errMsg = [];
                            this.errMsg = this.errMsg.concat(response.resultCode.message);
                        }
                        this.isLoadingData = false;
                    });
                }
            } else {
                // show error message?
                this.errMsg = [];
                this.errMsg = this.errMsg.concat(response.resultCode.message);
                this.isLoadingData = false;
            }
        });
    }
    // #EndRegion

    ngOnDestroy() {
        if (this.subscription != null)
          this.subscription.unsubscribe();
    }
}