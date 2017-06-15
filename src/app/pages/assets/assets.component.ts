import { Component, ViewChild, ApplicationRef, Input, ViewEncapsulation } from '@angular/core';
import { AssetService } from '../../services/asset.service';
import { LocationService } from '../../services/location.service';
import { WorkOrderService } from '../../services/work-order.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ModalDirective } from 'ng2-bootstrap';
import { TreeComponent } from 'angular2-tree-component';
import { SelectComponent } from 'ng2-select';

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

  public items_location;
  public items_wocategory;
  public items_asset;

  public assets$: Observable<any>;
  public assets;
  public work_orders$: Observable<any>;
  public locations$: Observable<any>;
  public form;
  public name;
  public description;
  public photo;
  public add_photo_file : FileList = null;
  public specification;

  public editForm;
  public edit_name;
  public edit_description;
  public edit_photo;
  public edit_photo_file : FileList;
  public edit_specification;
    
  public wocategory_id = null;
  public location_id = null;
  public submitted;
  public value;
  public selected_wo = null;
  public selected_location = null;
  public selected_asset = null;
  public selected_parent_asset = null;
  public treeAssets;
  public treeAssetsWithData = null;
  public asset_edit;
  public filterAssetName = null;
  public filterAssetCode = null;
  public wo_by_asset = null;
  public asset_pointer = null;

    @Input() public source: LocalDataSource = new LocalDataSource();

    

  @ViewChild('editSelectBox') editSelectBox: SelectComponent;
  @ViewChild('editWOSelectBox') editWOSelectBox: SelectComponent;
  @ViewChild('editLocationSelectBox') editLocationSelectBox: SelectComponent;
  @ViewChild('childModal') childModal: ModalDirective;
  @ViewChild('editChildModal') editChildModal: ModalDirective;
  @ViewChild('addSelectBox') addSelectBox: SelectComponent;
  @ViewChild('viewHistoryModal') viewHistoryModal: ModalDirective;
  @ViewChild(TreeComponent)
  private assets_tree: TreeComponent;

  constructor(
    public assetService: AssetService,
    public woService: WorkOrderService,
    public locationService: LocationService,
    public fb: FormBuilder
    ) {
      this.assets = null;
        this.form = fb.group({
          'name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'description': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'photo': [''],
            'specification': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
        });

      this.name = this.form.controls['name'];
      this.description = this.form.controls['description'];
      this.photo = this.form.controls['photo'];
      this.specification = this.form.controls['specification'];
      
      this.editForm = fb.group({
            'edit_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'edit_description': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
            'edit_photo': ['', Validators.required],
            'edit_specification': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
        });
      
      this.edit_name = this.editForm.controls['edit_name'];
      this.edit_description = this.editForm.controls['edit_description'];
      this.edit_photo = this.editForm.controls['edit_photo'];
      this.edit_specification = this.editForm.controls['edit_specification'];
      
      
      
  }

    public ngOnInit(){
        
      this.assets$ = this.assetService.getAssets();
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
        }
      );
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
      
        
    }

    public selectedWO(value: any){
        console.log('Selected value:', value);
        this.selected_wo = value;
    }
    public selectedLocation(value: any){
        console.log('Selected Value:', value);
        this.selected_location = value;
    }
    public typed(value: any){
        console.log('New Search Input:', value);
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
        this.submitted = true;
        
        if (this.form.valid) {
            console.log('Form Values:', values);
            var formatted_object = Object.assign({}, {
               id: values.id,
                name: values.name,
                description: values.description,
                photo: values.photo,
                specification: values.specification,
                wocategory_id: this.selected_wo.id,
                location_id: this.selected_location.id,
                parent_asset_id: null,
                photo_file: this.add_photo_file
            });
            
            if(this.selected_parent_asset != null){
                formatted_object.parent_asset_id = this.selected_parent_asset.id;
            }
            
            this.assetService.addAsset(formatted_object).subscribe(
                (data) => {
                    console.log('Response Data', data);
                    this.ngOnInit();
                    
                }
            );
            
        
            this.childModal.hide();
            
            // To Force Update of the Tree
            /*var temp_assets = JSON.parse(JSON.stringify(this.assets));
            this.treeAssets = [].concat(convertToTree(temp_assets));
            this.assets_tree.treeModel.update();*/
        }
    }
    public addChildNode(event){
        var selected_asset = {
            id: event.id,
            text: event.name
        }
        this.selected_asset = selected_asset;
        
        this.addSelectBox.active = [selected_asset];
        this.addSelectBox.ngOnInit();
        
        this.childModal.show();
    }
    public selectedAsset(event){
        console.log('Selected Asset', event);
        this.selected_parent_asset = event;
    }

    public addRootNode(){
        
        this.childModal.show();
    }
    public deleteAsset(node){
        
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
    public hideViewHistoryModal(){
        this.viewHistoryModal.hide();
    }
    public editAsset(event){
        console.log('Editing:', event);
        this.asset_edit = event;
        
        // Inject Initial Value to the Edit Form
        this.editForm.patchValue({ edit_name: event.name });
        this.editForm.patchValue({ edit_description: event.description });
        this.editForm.patchValue({ edit_photo: event.photo });
        this.editForm.patchValue({ edit_specification: event.specification});
        
        if(event.parent_asset_id != null){
            if (this.editSelectBox) {
              let asset_found = this.assetService.get(event.parent_asset_id);
            console.log('Got Here Bro');  
            this.asset_edit.selected_asset = {
                    id: event.parent_asset_id,
                    text: asset_found.name
              };
                
              // Only Done because bug in ng2-select
              this.editSelectBox.active = [this.asset_edit.selected_asset];
              this.editSelectBox.ngOnInit();
            }
        }
        console.log('Pass Parent');
        if(event.wocategory_id != null){
            if (this.editWOSelectBox) {
              let wocategory_found = this.woService.get(event.wocategory_id);
              this.asset_edit.selected_wocategory = {
                    id: event.wocategory_id,
                    text: wocategory_found.name
              };
                
              // Only Done because bug in ng2-select
              this.editWOSelectBox.active = [this.asset_edit.selected_wocategory];
              this.editWOSelectBox.ngOnInit();
            }
        }
        console.log('Pass WOCategory');
        if(event.location_id != null){
            if (this.editLocationSelectBox) {
              let location_found = this.locationService.get(event.location_id);
              this.asset_edit.selected_location = {
                    id: event.location_id,
                    text: location_found.name
              };
                
              // Only Done because bug in ng2-select
              this.editLocationSelectBox.active = [this.asset_edit.selected_location];
              this.editLocationSelectBox.ngOnInit();
            }
        }
        console.log('Location Edit Initial Select:', this.asset_edit.selected_location);
        this.editChildModal.show();
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
        console.log('EditForm:', values);
        if(this.editForm.valid){
            
            var formatted_object = Object.assign({}, {
               id: this.asset_edit.id,
                name: values.edit_name,
                description: values.edit_description,
                photo: values.edit_photo,
                specification: values.edit_specification,
                parent_asset_id: null,
                wocategory_id: null,
                location_id: null
            });
            if(this.asset_edit.selected_asset != null){
                formatted_object.parent_asset_id = this.asset_edit.selected_asset.id;
            }
            if(this.asset_edit.selected_location != null){
                formatted_object.location_id = this.asset_edit.selected_location.id;
            }
            if(this.asset_edit.selected_wocategory != null){
                formatted_object.wocategory_id = this.asset_edit.selected_wocategory.id;
            }
            let response = this.assetService.updateAsset(formatted_object);
            
            // TODO: Change to NgOnInit perhaps
            //this.assets = this.assetService.getAssetsNormal();
                        
            console.log('After Edit Locations', this.assets);
            var temp_assets = JSON.parse(JSON.stringify(this.assets));
            this.treeAssets = [].concat(convertToTree(temp_assets));
            console.log('After Edit Tree:', this.treeAssets);
            
            
            this.assets_tree.treeModel.update();
            this.editChildModal.hide();
            
        }
        
        //event.preventDefault();
    }
}
