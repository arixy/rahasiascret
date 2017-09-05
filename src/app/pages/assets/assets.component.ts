import { Component, ViewChild, ApplicationRef, Input, ViewEncapsulation } from '@angular/core';
import { Response } from '@angular/http';
import { AssetService } from '../../services/asset.service';
import { LocationService } from '../../services/location.service';
import { WorkOrderService } from '../../services/work-order.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ModalDirective } from 'ng2-bootstrap';
import { TreeComponent } from 'angular2-tree-component';
import { SelectComponent } from 'ng2-select';
import { TabPanel } from 'primeng/primeng';
import { saveAs } from 'file-saver';
import { GrowlMessage, MessageSeverity, MessageLabels } from '../../popup-notification';

function convertToTree(flat_data){
        console.log('Flat Data:', flat_data);
        var dataMap = flat_data.reduce(function(map, node) {
            map[node.assetId] = node;
            return map;
        }, {});
        console.log('Data Map', dataMap);
        // create the tree array
        var treeData = [];
        
        flat_data.forEach(function(node) {
            // add to parent
            var parent = dataMap[node.parentAssetId];
            console.log('node:',node);
            if (parent) {
                // must check first if children already exist?
                // create child array if it doesn't exist
                (parent.children || (parent.children = []))
                    // add node to child array
                    .push(node);
                console.log('parent:', parent);
            } else {
                // parent is null or missing
                treeData.push(node);
                console.log('tree push:', treeData);
            }
        });
        //console.log('Tree Data inside convert:', treeData);
        return treeData;
}

function convertToTreeData(flat_data){
        console.log('Flat Data:', flat_data);
        var dataMap = flat_data.reduce(function(map, node) {
            map[node.data.assetId] = node;
            return map;
        }, {});
        console.log('Data Map', dataMap);
        // create the tree array
        var treeData = [];
        
        flat_data.forEach(function(node) {
            // add to parent
            
            var parent = dataMap[node.data.parentAssetId];
            
            // Handle infinite loop case where parentId = assetId of itself
            if(node.data.parentAssetId == node.data.assetId){
                parent = null;
                
            }
            console.log('node:',node);
            if (parent) {
                // must check first if children already exist?
                // create child array if it doesn't exist
                (parent.children || (parent.children = []))
                    // add node to child array
                    .push(node);
                console.log('parent:', parent);
            } else {
                // parent is null or missing
                treeData.push(node);
                console.log('tree push:', treeData);
            }
        });
        //console.log('Tree Data inside convert:', treeData);
        return treeData;
}


function transformAssetIdToId(asset_tree){
    var str = JSON.stringify(asset_tree);
    str = str.replace(/assetId/g, 'id');
    asset_tree = JSON.parse(str);
    return asset_tree;
}

@Component({
  selector: 'assets',
  templateUrl: './assets.html',
  styleUrls: ['./assets.scss', './modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Assets {

  // Loading Component
  public submitLoading = false;
  public dataLoading = false;

  // Form Disabled for View
  public disabled = false;
  public items_location;
  public items_wocategory;
  public items_asset;

  public assets$: Observable<any>;
  public assets;
  public work_orders$: Observable<any>;
  public locations$: Observable<any>;
  public form;
  public name;
  public asset_number;
  public description;
  public photo;
  public add_photo_file : FileList = null;
  public specification;
  public wo_category_fc;
  public location_fc;

  public editForm;
  public edit_name;
  public edit_description;
  public edit_photo;
  public edit_photo_file : FileList;
  public edit_specification;
  public edit_asset_number;
    
  public wocategory_id = null;
  public location_id = null;
  public add_form_submitted = false;
  public edit_form_submitted = false;
  public value;
  public selected_wo = null;
  public selected_location = null;
  public selected_asset = null;
  public selected_parent_asset = null;
  public treeAssets;
  public treeAssetsWithData = null;
  public asset_edit;

  deleteConfirm;
  delete_name;

  error_from_server = [];
  public existingPhotos = [];
  public editExistingPhotos = [];

  // Form Control
  public filterAssetName = new FormControl();
  public filterAssetCode = new FormControl();
  public filterLocationName = new FormControl();

  public filter_master = {
      "name": {
          "matchMode": "undefined", 
          "value": ""
      }, 
      "assetNumber": {
          "matchMode": "undefined", 
          "value": ""
      }, 
      "locationName": {
          "matchMode": "undefined", 
          "value": ""
      }, 
      "dateUpdated": {
          "matchMode": "undefined", 
          "value": ""
      }
  };


  public wo_by_asset = null;
  public asset_pointer = null;

  // Testing custom class for tab
  public test_tab = "";

    @Input() public source: LocalDataSource = new LocalDataSource();

    

  @ViewChild('editSelectBox') editSelectBox: SelectComponent;
  @ViewChild('editWOSelectBox') editWOSelectBox: SelectComponent;
  @ViewChild('editLocationSelectBox') editLocationSelectBox: SelectComponent;
  @ViewChild('childModal') childModal: ModalDirective;
  @ViewChild('editChildModal') editChildModal: ModalDirective;
  @ViewChild('addSelectBox') addSelectBox: SelectComponent;
  @ViewChild('addWOSelectBox') addWOSelectBox: SelectComponent;
  @ViewChild('addLocationSelectBox') addLocationSelectBox: SelectComponent;
  @ViewChild('viewHistoryModal') viewHistoryModal: ModalDirective;
  @ViewChild('viewAssetModal') viewAssetModal: ModalDirective;
  @ViewChild(TreeComponent)
  private assets_tree: TreeComponent;
  @ViewChild('deleteModal') deleteModal: ModalDirective;
  @ViewChild('addGeneralTab') addGeneralTab : TabPanel;
  @ViewChild('editGeneralTab') editGeneralTab : TabPanel;

  constructor(
    public assetService: AssetService,
    public woService: WorkOrderService,
    public locationService: LocationService,
    public fb: FormBuilder
    ) {
      this.assets = null;
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required])],
          'asset_number': ['', Validators.compose([Validators.required])],
          'description': ['', Validators.compose([Validators.required])],
            'photo': [''],
            'specification': ['', Validators.compose([Validators.required])],
            'wo_category_fc': ['', Validators.compose([Validators.required])],
            'location_fc': ['', Validators.compose([Validators.required])]
        });

      this.name = this.form.controls['name'];
      this.description = this.form.controls['description'];
      this.photo = this.form.controls['photo'];
      this.specification = this.form.controls['specification'];
      this.asset_number = this.form.controls['asset_number'];
      this.wo_category_fc = this.form.controls['wo_category_fc'];
      this.location_fc = this.form.controls['location_fc'];
      
      this.editForm = fb.group({
            'edit_name': ['', Validators.compose([Validators.required])],
            'edit_description': ['', Validators.compose([Validators.required])],
            'edit_specification': ['', Validators.compose([Validators.required])],
            'edit_asset_number': ['', Validators.compose([Validators.required])]
        });
      
      this.edit_name = this.editForm.controls['edit_name'];
      this.edit_description = this.editForm.controls['edit_description'];
      this.edit_specification = this.editForm.controls['edit_specification'];
      this.edit_asset_number = this.editForm.controls['edit_asset_number'];
      
      // Check for changes in form
      this.form.valueChanges.subscribe(data => {
         if(this.form.valid && this.add_form_submitted){
             this.addGeneralTab.headerStyleClass = '';
         }
      });
      
      this.editForm.valueChanges.subscribe(data => {
         if(this.editForm.valid && this.edit_form_submitted){
             this.editGeneralTab.headerStyleClass = '';
         } 
      });
  }

    public ngOnInit(){
        this.dataLoading = true;
        this.initialRefresh(this.filter_master);
      
      /*this.assets$ = this.assetService.getAssets();
      this.assets$.subscribe(
        (data) => {
            console.log('Data From Server', data);
            this.assets = data.data;
            this.items_asset = data.data;
            
            var assets_with_data = this.assets.map(
                (asset) => {
                    return Object.assign({}, {
                       data: asset 
                    });
                }
            );
            console.log('Asset with Data', assets_with_data);
            this.treeAssetsWithData = convertToTreeData(assets_with_data);
            console.log('Tree Asset with Data', this.treeAssetsWithData);
            
            var temp_assets = JSON.parse(JSON.stringify(this.assets));
            this.treeAssets = convertToTree(temp_assets);
            
            this.treeAssets = transformAssetIdToId(this.treeAssets);
            console.log('Assets Tree', this.treeAssets);
            
            this.items_asset = this.items_asset.map(
                (asset_object) => {
                    return Object.assign({}, {
                       id: asset_object.assetId,
                        text: asset_object.name
                    });
                }
            );
            
            this.dataLoading = false;
        }
      );
      */
      this.locations$ = this.locationService.getLocations();
      this.work_orders$ = this.woService.getWOs();
      
      this.locations$.subscribe(
        (data) => {
            this.items_location = data.data;
            console.log('Items Locations:');
            console.log(this.items_location);
            this.items_location = this.items_location.map(
                (location_object) => {
                    return Object.assign({}, {
                       id: location_object.locationId,
                        text: location_object.name
                    });
                }
              );
        }
      );
      this.work_orders$.subscribe(
        (data) => {
            this.items_wocategory = data.data;
            console.log('Items WOCat:', this.items_wocategory);
            this.items_wocategory = this.items_wocategory.map(
                (wo_category_object) => {
                    return Object.assign({}, {
                        id: wo_category_object.woCategoryId,
                        text: wo_category_object.name
                    });
                }
              );
            console.log('Items WOCat:', this.items_wocategory);
            
        }
      );
      
        
        // Filter Form Control
        this.filterAssetName.valueChanges.debounceTime(800).subscribe(
            (filter_text) => {
                console.log('Filter Text', filter_text);
                this.filter_master.name = {
                    matchMode: undefined,
                    value: filter_text
                }
                this.refresh(this.filter_master);
            }
        );
        
        this.filterAssetCode.valueChanges.debounceTime(800).subscribe(
            (filter_text) => {
                console.log('Filter Text', filter_text);
                this.filter_master.assetNumber = {
                    matchMode: undefined,
                    value: filter_text
                }
                this.refresh(this.filter_master);
            }
        );
        
        this.filterLocationName.valueChanges.debounceTime(800).subscribe(
            (filter_text) => {
                console.log('Filter Location', filter_text);
                this.filter_master.locationName = {
                    matchMode: undefined,
                    value: filter_text
                }
                this.refresh(this.filter_master);
            }
        );
        
    }
    
    public initialRefresh(filter_master){
        
        // So that Dropdown for parent is still correct
        this.dataLoading = true;
        var formatted_object = {
            filters : filter_master,
            first: 0,
            rows: 9999,
            globalFilter: '',
            multiSortMeta: null,
            sortField: 'dateUpdated',
            sortOrder: -1
        }
        console.log('Shoot Refresh', formatted_object);
        this.assetService.getAssetsFilter(formatted_object).subscribe(
            (data) => {
                this.dataLoading = false;
                console.log('Refresh Data', data);
                this.assets = data.data;

                this.assets = data.data;
                this.items_asset = data.data;

                this.items_asset = this.items_asset.map(
                    (asset_object) => {
                        return Object.assign({}, {
                           id: asset_object.assetId,
                            text: asset_object.name
                        });
                    }
                );
                var assets_with_data = this.assets.map(
                    (asset) => {
                        return Object.assign({}, {
                           data: asset 
                        });
                    }
                );
                console.log('Asset with Data', assets_with_data);
                this.treeAssetsWithData = convertToTreeData(assets_with_data);
                console.log('Tree Asset with Data', this.treeAssetsWithData);

                var temp_assets = JSON.parse(JSON.stringify(this.assets));
                this.treeAssets = convertToTree(temp_assets);

                this.treeAssets = transformAssetIdToId(this.treeAssets);
                console.log('Assets Tree', this.treeAssets);
            }
        );
    }

    public refresh(filter_master){
        this.dataLoading = true;
        var formatted_object = {
            filters : filter_master,
            first: 0,
            rows: 9999,
            globalFilter: '',
            multiSortMeta: null,
            sortField: 'dateUpdated',
            sortOrder: -1
        }
        console.log('Shoot Refresh', formatted_object);
        this.assetService.getAssetsFilter(formatted_object).subscribe(
            (data) => {
                this.dataLoading = false;
                console.log('Refresh Data', data);
                this.assets = data.data;

                var assets_with_data = this.assets.map(
                    (asset) => {
                        return Object.assign({}, {
                           data: asset 
                        });
                    }
                );
                console.log('Asset with Data', assets_with_data);
                this.treeAssetsWithData = convertToTreeData(assets_with_data);
                console.log('Tree Asset with Data', this.treeAssetsWithData);

                var temp_assets = JSON.parse(JSON.stringify(this.assets));
                this.treeAssets = convertToTree(temp_assets);

                this.treeAssets = transformAssetIdToId(this.treeAssets);
                console.log('Assets Tree', this.treeAssets);
            }
        );
    }

    public selectedWOCategory(value: any){
        console.log('Selected value:', value);
        this.selected_wo = value;
        
        // for error detection
        this.wo_category_fc.setValue(value);
    }
    public removedWOCategory(value: any){
        this.selected_wo = null;
        
        // for error detection
        this.wo_category_fc.setValue(null);
    }
    public selectedLocation(value: any){
        console.log('Selected Value:', value);
        this.selected_location = value;
        
        // for error detection
        this.location_fc.setValue(value);
    }
    public typed(value: any){
        console.log('New Search Input:', value);
    }
    public removedLocation(value: any){
        console.log('Removed value is:', value);
        this.selected_location = null;
        
        // for error detection
        this.location_fc.setValue(null);
    }

    
    public removed(value: any){
        console.log('Removed value is:', value);
    }

    public addPhotoSelected(event){
        console.log('AddPhoto', event);
        this.add_photo_file = event.target.files;
        console.log('add photo file', this.add_photo_file);
    }
    public onSubmit(values):void {
        
        // To Trigger Error message only when form is submitted
        this.add_form_submitted = true;
        
        
        if (this.form.valid) {
            this.submitLoading = true;
            console.log('Form Values:', values);
            var formatted_object = Object.assign({}, {
               id: values.id,
                name: values.name,
                asset_number: values.asset_number,
                description: values.description,
                photo: values.photo,
                specification: values.specification,
                wocategory_id: this.selected_wo.id,
                location_id: this.selected_location.id,
                parent_asset_id: null,
                photo_file: this.readyPhotosData(this.existingPhotos)
            });
            
            if(this.selected_parent_asset != null){
                formatted_object.parent_asset_id = this.selected_parent_asset.id;
            }
            
            // Moved from Service to here, to more easily accommodate files
            var final_formatted_object = {
                asset: {
                    name: formatted_object.name,
                    assetNumber: formatted_object.asset_number,
                    description: formatted_object.description,
                    specification: formatted_object.specification,
                    relatedVendorId: 1,
                    parentAssetId: formatted_object.parent_asset_id,
                    locationId: formatted_object.location_id,
                    woCategoryId: formatted_object.wocategory_id
                },
                assetPhotos: this.readyPhotosData(this.existingPhotos)
            }
            
            let formData: FormData = new FormData();
            formData.append("params", JSON.stringify(final_formatted_object));
            
            console.log('final formatted object', final_formatted_object);
            console.log('Existing Photos', this.existingPhotos);
            // Loop through Photos
            for (var i = 0; i < this.existingPhotos.length; i++) {
                    if (this.existingPhotos[i].isActive == false) continue;

                    if (this.existingPhotos[i].isActive && this.existingPhotos[i].workOrderPhotoId == null) {
                        let actualFile: File = this.existingPhotos[i].actualFile;
                        //formData.append("assetPhotos", actualFile);
                        formData.append("assetPhotos", actualFile);
                    }
            }
            
            this.assetService.addAsset(formData).subscribe(
                (data) => {
                    this.submitLoading = false;
                    console.log('Response Data', data);
                    
                    if(data.resultCode.code == 0){
                        // Success
                        // Clear all input in the form
                        this.clearFormInputs(this.form);

                        // Specific clearing for add select boxes
                        this.selected_parent_asset = null;

                        this.addSelectBox.active = [];
                        this.addSelectBox.ngOnInit();

                        this.addWOSelectBox.active = [];
                        this.addWOSelectBox.ngOnInit();

                        this.addLocationSelectBox.active = [];
                        this.addLocationSelectBox.ngOnInit();

                        this.childModal.hide();
                        
                        // Growl Message Success
                        GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                        
                        this.ngOnInit();
                        
                        
                    } else {
                        // Error
                        this.error_from_server = [];
                        this.error_from_server = this.error_from_server.concat(data.resultCode.message);
                    }
                    
                    
                }
            );
            
        
            
        } else {
            this.addGeneralTab.headerStyleClass = "tabpanel-has-error";
        }
    }

    public addChildNode(event){
        console.log('Event Add Child', event);
        var selected_asset = {
            id: event.data.assetId,
            text: event.data.name
        }
        this.selected_parent_asset = selected_asset;
        
        this.addSelectBox.active = [selected_asset];
        this.addSelectBox.ngOnInit();
        
        this.childModal.show();
    }

    public selectedAsset(event){
        console.log('Selected Asset', event);
        this.selected_parent_asset = event;
    }

    public addRootNode(){
        this.add_form_submitted = false;
        this.disabled = false;
        this.childModal.show();
    }

    public deleteClose(){
        this.deleteModal.hide();
    }

    public deleteAsset(node){
        this.deleteConfirm = node;
        console.log('Delete Confirm', this.deleteConfirm);
        this.delete_name = node.data.name;
        this.deleteModal.show();
        
    }

    public saveDelete(){
        this.assetService.deleteAsset(this.deleteConfirm.data.assetId).subscribe(
            (data) => {
                
                console.log('Return Data', data);
                if(data.resultCode.code == 0){
                    // Growl Message Success
                    GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.DELETE_SUCCESS);
                } else {
                    // Error
                    let error_delete = [];
                    error_delete = error_delete.concat(data.resultCode.message);
                    GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.DELETE_ERROR + error_delete[0]);
                }
                this.ngOnInit();
            }
        );
        this.deleteModal.hide();
    }
    public viewAssetHistory(node){
        console.log('Node', node);
        this.asset_pointer = node;
        this.viewHistoryModal.show();
        // Initialize the Table Here
        this.assetService.getWObyAsset(node.data.assetId).subscribe(
            (data) => {
                console.log('Data Get WO by Asset', data);
                this.wo_by_asset = data.data;
                
            }
        );
        
    }

    public refreshAssetHistory(){
        
        if(this.asset_pointer){
            this.assetService.getWObyAsset(this.asset_pointer.data.assetId).subscribe(
                (data) => {
                    console.log('Data Get WO by Asset', data);
                    this.wo_by_asset = data.data;

                }
            );   
        }
    }
    public hideViewHistoryModal(){
        this.viewHistoryModal.hide();
    }
    public viewAsset(event){
        //this.asset_pointer = event;
        //this.viewAssetModal.show();
        
        this.asset_edit = event;
        // Inject Initial Value to the Edit Form
        // Request 'Get' Again from Server
        this.assetService.get(event.data.assetId).subscribe(
            (single_data) => {
                console.log('Asset Single Data', single_data);
                // Inject Initial Value to the Edit Form
                this.editForm.patchValue(
                    {
                        edit_name: single_data.data.asset.name,
                        edit_description: single_data.data.asset.description,
                        edit_photo: single_data.data.assetPhoto,
                        edit_specification: single_data.data.asset.specification,
                        edit_asset_number: single_data.data.asset.assetNumber
                    }
                );
                
                // Populate Photos
                if(single_data.data.assetPhoto.length > 0){
                    this.editExistingPhotos = single_data.data.assetPhoto;    
                } else {
                    this.editExistingPhotos = [];
                }
                
                if(single_data.data.asset.parentAssetId){
                    if (this.editSelectBox) {
                      let assets_data = this.assets;
                        console.log('Assets pas Editing', this.assets);
                      let asset_found = assets_data.filter(
                        (assets_object) => {
                            return assets_object.assetId == single_data.data.asset.parentAssetId;
                        }
                      );
                    console.log('Asset Found', asset_found);
                    if(asset_found.length > 0){
                        this.asset_edit.selected_asset = {
                            id: single_data.data.asset.parentAssetId,
                            text: asset_found[0].name
                        };

                          // Only Done because bug in ng2-select
                          this.editSelectBox.active = [this.asset_edit.selected_asset];
                          this.editSelectBox.ngOnInit();
                        }    
                    }     

                }
                console.log('Pass Parent');
                if(single_data.data.asset.woCategoryId != null){
                    if (this.editWOSelectBox) {

                        console.log('Items WO Cat', this.items_wocategory);
                      let wocategory_found = this.items_wocategory.filter(
                        (wo_category_object) => {
                            return wo_category_object.id == single_data.data.asset.woCategoryId;
                        }
                      );
                        console.log('WOCategory Found', wocategory_found);  
                        if(wocategory_found.length > 0){
                            this.asset_edit.selected_wocategory = {
                                id: single_data.data.asset.woCategoryId,
                                text: wocategory_found[0].text
                            };

                            // Only Done because bug in ng2-select
                            this.editWOSelectBox.active = [this.asset_edit.selected_wocategory];
                            this.editWOSelectBox.ngOnInit();
                        }  
                    }
                }
                console.log('Pass WOCategory');
                if(single_data.data.asset.locationId != null){
                    if (this.editLocationSelectBox) {
                      let location_found = this.items_location.filter(
                            (location_object) => {
                                return location_object.id == single_data.data.asset.locationId;
                            }
                      );
                      if(location_found.length > 0){
                            this.asset_edit.selected_location = {
                                id: single_data.data.asset.locationId,
                                text: location_found[0].text
                          };

                          // Only Done because bug in ng2-select
                          this.editLocationSelectBox.active = [this.asset_edit.selected_location];
                          this.editLocationSelectBox.ngOnInit();    
                      }

                    }
                }
                console.log('Location Edit Initial Select:', this.asset_edit.selected_location);
                this.editChildModal.show();
            }
        );
        
        // Disable Stuff in Here
        this.editForm.disable();
        this.disabled = true;
        this.editChildModal.show();
    }

    public editAsset(event){
        console.log('Editing Asset:', event);
        this.edit_form_submitted = false;
        this.asset_edit = event;
        this.disabled = false;
        this.editForm.enable();
        
        // Request 'Get' Again from Server
        this.assetService.get(event.data.assetId).subscribe(
            (single_data) => {
                console.log('Asset Single Data', single_data);
                // Inject Initial Value to the Edit Form
                this.editForm.patchValue(
                    {
                        edit_name: single_data.data.asset.name,
                        edit_description: single_data.data.asset.description,
                        edit_photo: single_data.data.assetPhoto,
                        edit_specification: single_data.data.asset.specification,
                        edit_asset_number: single_data.data.asset.assetNumber
                    }
                );
                
                // Populate Photos
                if(single_data.data.assetPhoto.length > 0){
                    this.editExistingPhotos = single_data.data.assetPhoto;    
                } else {
                    this.editExistingPhotos = [];
                }
                
                if(single_data.data.asset.parentAssetId){
                    if (this.editSelectBox) {
                      let assets_data = this.assets;
                        console.log('Assets pas Editing', this.assets);
                      let asset_found = assets_data.filter(
                        (assets_object) => {
                            return assets_object.assetId == single_data.data.asset.parentAssetId;
                        }
                      );
                    console.log('Asset Found', asset_found);
                    if(asset_found.length > 0){
                        this.asset_edit.selected_asset = {
                            id: single_data.data.asset.parentAssetId,
                            text: asset_found[0].name
                        };

                          // Only Done because bug in ng2-select
                          this.editSelectBox.active = [this.asset_edit.selected_asset];
                          this.editSelectBox.ngOnInit();
                        }    
                    }     

                }
                console.log('Pass Parent');
                if(single_data.data.asset.woCategoryId != null){
                    if (this.editWOSelectBox) {

                        console.log('Items WO Cat', this.items_wocategory);
                      let wocategory_found = this.items_wocategory.filter(
                        (wo_category_object) => {
                            return wo_category_object.id == single_data.data.asset.woCategoryId;
                        }
                      );
                        console.log('WOCategory Found', wocategory_found);  
                        if(wocategory_found.length > 0){
                            this.asset_edit.selected_wocategory = {
                                id: single_data.data.asset.woCategoryId,
                                text: wocategory_found[0].text
                            };

                            // Only Done because bug in ng2-select
                            this.editWOSelectBox.active = [this.asset_edit.selected_wocategory];
                            this.editWOSelectBox.ngOnInit();
                        }  
                    }
                }
                console.log('Pass WOCategory');
                if(single_data.data.asset.locationId != null){
                    if (this.editLocationSelectBox) {
                      let location_found = this.items_location.filter(
                            (location_object) => {
                                return location_object.id == single_data.data.asset.locationId;
                            }
                      );
                      if(location_found.length > 0){
                            this.asset_edit.selected_location = {
                                id: single_data.data.asset.locationId,
                                text: location_found[0].text
                          };

                          // Only Done because bug in ng2-select
                          this.editLocationSelectBox.active = [this.asset_edit.selected_location];
                          this.editLocationSelectBox.ngOnInit();    
                      }

                    }
                }
                console.log('Location Edit Initial Select:', this.asset_edit.selected_location);
                this.editChildModal.show();
            }
        );
        
        
    }

    public selectedLocationEdit(value){
        this.asset_edit.selected_location = value;
    }
    public selectedWOEdit(value){
        this.asset_edit.selected_wocategory = value;
    }
    public selectedAssetEdit(value){
        this.asset_edit.selected_asset = value;
    }
    public changeFilterName(event){
        console.log('Filter Name Input', event);
        //this.filterAssetName = ;
    }
    public changeFilterCode(event){
        console.log('Filter Code Input', event);
    }
    public onSubmitEdit(values,event) {
        //event.preventDefault();
        
        // Trigger Validation 
        this.edit_form_submitted = true;
        
        console.log('EditForm:', values);
        if(this.editForm.valid){
            this.submitLoading = true;
            var formatted_object = Object.assign({}, {
               id: this.asset_edit.data.assetId,
                name: values.edit_name,
                description: values.edit_description,
                photo: values.edit_photo,
                specification: values.edit_specification,
                asset_number: values.edit_asset_number,
                parent_asset_id: null,
                wocategory_id: null,
                location_id: null
            });
            console.log('Selected Asset Edit', this.asset_edit);
            if(this.asset_edit.selected_asset != null){
                formatted_object.parent_asset_id = this.asset_edit.selected_asset.id;
            }
            if(this.asset_edit.selected_location != null){
                formatted_object.location_id = this.asset_edit.selected_location.id;
            }
            if(this.asset_edit.selected_wocategory != null){
                formatted_object.wocategory_id = this.asset_edit.selected_wocategory.id;
            }
            
            // Moved from Service to here, to more easily accommodate upload photos
            var final_formatted_object = {
                asset: {
                    assetId: formatted_object.id,
                    assetNumber: formatted_object.asset_number,
                    name: formatted_object.name,
                    description: formatted_object.description,
                    specification: formatted_object.specification,
                    relatedVendorId: 1,
                    parentAssetId: formatted_object.parent_asset_id,
                    locationId: formatted_object.location_id,
                    woCategoryId: formatted_object.wocategory_id,
                    isActive: true
                },
                assetPhotos: this.readyPhotosData(this.editExistingPhotos),
                deletedPhotosId: this.readyDeletedPhotosData(this.editExistingPhotos)
            };
            
            let formData: FormData = new FormData();
            formData.append("params", JSON.stringify(final_formatted_object));
            
            console.log('final formatted object edit', final_formatted_object);
            console.log('Existing Edit Photos', this.editExistingPhotos);
            // Loop through Photos
            for (var i = 0; i < this.editExistingPhotos.length; i++) {
                    if (this.editExistingPhotos[i].isActive == false) continue;

                    if (this.editExistingPhotos[i].isActive && this.editExistingPhotos[i].assetPhotoId == null) {
                        let actualFile: File = this.editExistingPhotos[i].actualFile;
                        //formData.append("assetPhotos", actualFile);
                        formData.append("assetPhotos", actualFile);
                    }
            }
            this.assetService.updateAsset(formData).subscribe(
                (data) => {
                    this.submitLoading = false;
                    console.log('Data after update', data);
                    this.editChildModal.hide();
                    this.ngOnInit();
                }
            );         
        } else {
            this.editGeneralTab.headerStyleClass = "tabpanel-has-error";
        }
        
        //event.preventDefault();
    }

    public clearFormInputs(form){
        form.reset();
    }

    public resetFilters(table){
        
        // Clear all filter in filter master. Might be Redundant
        this.filter_master.name.value = "";
        this.filter_master.assetNumber.value = "";
        this.filter_master.locationName.value = "";
        this.filter_master.dateUpdated.value = "";
        
        // Actually changing the value on the input field. Auto Refresh
        this.filterAssetCode.setValue("");
        this.filterAssetName.setValue("");
        this.filterLocationName.setValue("");
        
    }

    public resetFiltersTable(table){
        
        console.log('Table to be reset', table);
        table.reset();
    }

    public hideEditModal(){
        this.editChildModal.hide();
    }
    
    public hideModal(){
        this.editChildModal.hide();
        this.childModal.hide();
        this.viewHistoryModal.hide();
        this.viewAssetModal.hide();
    }

    public cancel(){
        this.hideModal();
        
        // Maybe some other logic to reset the form
        // Clear all input in the form
        this.clearFormInputs(this.form);
                    
        // Specific clearing for add select boxes
        this.addSelectBox.active = [];
        this.addSelectBox.ngOnInit();

        this.addWOSelectBox.active = [];
        this.addWOSelectBox.ngOnInit();

        this.addLocationSelectBox.active = [];
        this.addLocationSelectBox.ngOnInit();
        
        // Clear Tab Style 
        this.addGeneralTab.headerStyleClass = '';
    }

    readyPhotosData(existingPhotos) {
        var currentActivePhotos = [];

        for (var i = 0; i < existingPhotos.length; i++) {
            var tmpFile = existingPhotos[i];

            if (tmpFile.isActive
                //&& tmpFile.actualFile.type.includes("image")
                && tmpFile.assetPhotoId == null) {
                currentActivePhotos.push({ name: tmpFile.name, notes: tmpFile.notes });
            }
        }

        return currentActivePhotos;
    }
    readyDeletedPhotosData(existingPhotos) {
        var deletedPhotos = [];

        for (var i = 0; i < existingPhotos.length; i++) {
            var tmpFile = existingPhotos[i];

            if (!tmpFile.isActive
                && tmpFile.assetPhotoId != null) {
                deletedPhotos.push(tmpFile.assetPhotoId);
            }
        }

        return deletedPhotos;
    }

    public exportCSV(){
        
        // Similar logic to refresh since using filter as well
        this.dataLoading = true;
        var formatted_object = {
            filters : this.filter_master,
            first: 0,
            rows: 9999,
            globalFilter: '',
            multiSortMeta: null,
            sortField: 'dateUpdated',
            sortOrder: -1
        }
        console.log('Shoot Refresh', formatted_object);
        this.assetService.getCSV(formatted_object).subscribe(
            (data) => {
                this.dataLoading = false;
                console.log('Refresh Data', data);
                this.downloadFile(data);
            }
        );
    } 

    private downloadFile(data: Response){
        var blob = new Blob([data.blob()], { type: data.headers.get('Content-Type') });
        saveAs(blob, 'assets.csv');
      //var url = window.URL.createObjectURL(blob);
      //window.open(url);
    }
}
