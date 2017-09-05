import { Component, ViewChild, NgZone, ApplicationRef, ViewEncapsulation } from '@angular/core';
import { NgUploaderOptions } from 'ngx-uploader';
import { LocationService } from '../../../../services/location.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { TreeComponent } from 'angular2-tree-component';
import { ModalDirective } from 'ng2-bootstrap';
import { SelectComponent } from 'ng2-select';

function convertToTree(flat_data){
        console.log('Flat Data:', flat_data);
        var dataMap = flat_data.reduce(function(map, node) {
            map[node.locationId] = node;
            return map;
        }, {});
        console.log('Data Map', dataMap);
        // create the tree array
        var treeData = [];
        
        flat_data.forEach(function(node) {
            // add to parent
            var parent = dataMap[node.parentLocationId];
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
            map[node.data.locationId] = node;
            return map;
        }, {});
        console.log('Data Map', dataMap);
        // create the tree array
        var treeData = [];
        
        flat_data.forEach(function(node) {
            // add to parent
            
            var parent = dataMap[node.data.parentLocationId];
            
            // Handle infinite loop case where parentId = assetId of itself
            if(node.data.parentLocationId == node.data.locationId){
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
function transformLocationIdToId(location_tree){
    var str = JSON.stringify(location_tree);
    str = str.replace(/locationId/g, 'id');
    location_tree = JSON.parse(str);
    return location_tree;
}

@Component({
  selector: 'layouts',
  styleUrls: ['./modals.scss'],
  templateUrl: './locations.html',
  encapsulation: ViewEncapsulation.None
    /*
  styles: [
            ".node-content-wrapper {\n      display: inline-block;\n      padding: 2px 5px;\n      border-radius: 2px;\n      transition: background-color .15s,box-shadow .15s;\n    }",
            '.node-wrapper {display: flex; align-items: flex-start;}',
            '.tree-node-active > .node-wrapper > .node-content-wrapper { background:  red !important }',
            '.tree-node-active.tree-node-focused > .node-wrapper > .node-content-wrapper { background:  red !important }',
            '.tree-node-focused > .node-wrapper > .node-content-wrapper { background: red !important }',
            '.node-content-wrapper:hover { background: red !important }',
            ".tree-node-active > .node-wrapper > .node-content-wrapper, .tree-node-focused > .node-content-wrapper, .node-content-wrapper:hover {\n      box-shadow: inset 0 0 1px #999;\n    }",
            '.node-content-wrapper.is-dragging-over { background: #ddffee; box-shadow: inset 0 0 1px #999; }',
            '.node-content-wrapper.is-dragging-over-disabled { opacity: 0.5 }'
        ]*/
})
export class Locations {
    
  public defaultPicture = 'assets/img/theme/no-photo.png';
  public profile:any = {
    picture: 'assets/img/app/profile/Nasta.png'
  };
  public uploaderOptions:NgUploaderOptions = {
    // url: 'http://website.com/upload'
    url: '',
  };
  public locations;
  public locations$: Observable<any>;
  public form;
  public editForm;
  public name;
  public description;
  public edit_name;
  public edit_description;
  public editDescription;
  public submitted;
  public items_location;
  public selected_location;
  public value;
  public treeLocations = null;
  public treeLocationsWithData = null;
  deleteConfirm;
  delete_name;

  add_form_submitted = false;
  edit_form_submitted = false;

  // Loading State
  public dataLoading = false;
  public submitLoading = false;

  public location_edit = null /*{
    id: null,
    name: '',
    description: '',
    parent_location_id: null,
    selected_location: null
  };*/

  public filter_master = {
      "name": {
        "matchMode": "undefined",
        "value": ""
        },
      "description": {
        "matchMode": "undefined",
        "value": ""
        }
  };
  
  @ViewChild('editSelectBox') editSelectBox: SelectComponent;
  @ViewChild('childModal') childModal: ModalDirective;
  @ViewChild('editChildModal') editChildModal: ModalDirective;
  @ViewChild('addSelectBox') addSelectBox: SelectComponent;
  @ViewChild(TreeComponent)
  private locations_tree: TreeComponent;
  @ViewChild('deleteModal') deleteModal: ModalDirective;

  constructor(
    public locationService: LocationService,
    public fb: FormBuilder,
    public zone: NgZone,
    public appRef: ApplicationRef
  ) {
      this.locations = null;
      this.form = fb.group({
          'name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'description': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
      });
      
      this.editForm = fb.group({
          'edit_name': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'edit_description': ['', Validators.compose([Validators.required, Validators.minLength(2)])]
      });
      
      this.name = this.form.controls['name'];
      this.description = this.form.controls['description'];
      
      this.edit_name = this.editForm.controls['edit_name'];
      this.edit_description = this.editForm.controls['edit_description'];
      
      
      
      console.log('Tree Location:', this.treeLocations);
  }

  public ngOnInit() {
      
      //BUG on SERVER
      this.dataLoading = true;
      this.initialRefresh(this.filter_master);
      /*this.locations$ = this.locationService.getLocations();
      this.locations$.subscribe(
        (data) => {
            this.locations = data.data;
            this.items_location = data.data;
            
            console.log('Initial Locations Data:', this.locations);
            
            var locations_with_data = this.locations.map(
                (location) => {
                    return Object.assign({}, {
                       data: location 
                    });
                }
            
            );
            this.treeLocationsWithData = convertToTreeData(locations_with_data);
            
            
            var temp_locations = JSON.parse(JSON.stringify(this.locations));
            this.treeLocations = convertToTree(temp_locations);
            
            this.treeLocations = transformLocationIdToId(this.treeLocations);
            console.log('After calling convert to tree', this.treeLocations);
            
            this.items_location = this.items_location.map(
                (location_object) => {
                    return Object.assign({}, {
                       id: location_object.locationId,
                        text: location_object.name
                    });
                }
              );
        }
      );*/
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
        this.locationService.getLocationsFilter(formatted_object).subscribe(
            (data) => {
                this.dataLoading = false;
                console.log('Refresh Data', data);
                
                this.locations = data.data;
                this.items_location = data.data;

                this.items_location = this.items_location.map(
                    (asset_object) => {
                        return Object.assign({}, {
                           id: asset_object.locationId,
                            text: asset_object.name
                        });
                    }
                );
                var locations_with_data = this.locations.map(
                    (location) => {
                        return Object.assign({}, {
                           data: location 
                        });
                    }
                );
                
                console.log('Location with Data', locations_with_data);
                this.treeLocationsWithData = convertToTreeData(locations_with_data);
                console.log('Tree Location with Data', this.treeLocationsWithData);

                var temp_locations = JSON.parse(JSON.stringify(this.locations));
                this.treeLocations = convertToTree(temp_locations);

                this.treeLocations = transformLocationIdToId(this.treeLocations);
                console.log('Locations Tree', this.treeLocations);
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
        this.locationService.getLocationsFilter(formatted_object).subscribe(
            (data) => {
                this.dataLoading = false;
                console.log('Refresh Data', data);
                this.locations = data.data;

                var locations_with_data = this.locations.map(
                    (location) => {
                        return Object.assign({}, {
                           data: location 
                        });
                    }
                );
                console.log('Location with Data', locations_with_data);
                this.treeLocationsWithData = convertToTreeData(locations_with_data);
                console.log('Tree Location with Data', this.treeLocationsWithData);

                var temp_locations = JSON.parse(JSON.stringify(this.locations));
                this.treeLocations = convertToTree(temp_locations);

                this.treeLocations = transformLocationIdToId(this.treeLocations);
                console.log('Locations Tree', this.treeLocations);
            }
        );
    }

    public selectedLocation(value: any){
        console.log('Selected Value:', value);
        this.selected_location = value;
    }
    public selectedLocationEdit(value){
        this.location_edit.selected_location = value;
    }

    public refreshValue(value: any){
        this.value = value;
    }
    
    public removed(value: any){
        console.log('Removed value is:', value);
    }

    public onSubmitEdit(values,event) {
        //event.preventDefault();
        console.log('EditForm:', values);
        console.log('Location Edit', this.location_edit);
        if(this.editForm.valid){
            
            var formatted_object = Object.assign({}, {
               id: this.location_edit.data.locationId,
                name: values.edit_name,
                description: values.edit_description,
                parent_location_id: null
            });
            if(this.location_edit.selected_location != null){
                formatted_object.parent_location_id = this.location_edit.selected_location.id;
            }
            
            this.locationService.updateLocation(formatted_object).subscribe(
                (data) => {
                    console.log('Response Update Data', data);
                    this.ngOnInit();
                }
            );
            
            this.editChildModal.hide();
            
        }
        
        //event.preventDefault();
    }
    public onSubmit(values):void {
        this.submitted = true;
        
        if (this.form.valid) {
            console.log(values);
          // your code goes here
            var formatted_object = Object.assign({}, {
                id: values.id,
                name: values.name,
                description: values.description,
                parent_location_id: null,
                isRoot: true,
                haveChild: true
            });
            
            
            if(this.selected_location != null){
                formatted_object.parent_location_id = this.selected_location.id;
                formatted_object.isRoot = false;
            }
            
            console.log('Formatted_object:', formatted_object);
            
            this.locationService.addLocation(formatted_object).subscribe(
                (data) => {
                    
                    console.log('Response Data', data);
                    
                    //this.appRef.tick();
                    //var temp_locations = JSON.parse(JSON.stringify(this.locations));
                    //this.treeLocations = [].concat(convertToTree(temp_locations));
                    //this.locations_tree.treeModel.update();
                    
                    console.log('Tree Model:', this.locations_tree);
                    console.log('The Locations Tree:', this.treeLocations);
                    console.log('The Locations:', this.locations);
                    // Perhaps ngOnInit works better?
                    this.ngOnInit();
                }
            );
            
            
            this.childModal.hide();
        }
    }

    public addChildNode(event){
        console.log('Tree Node Click', event);
        
        
        var selected_location = {
            id: event.id,
            text: event.name
        }
        this.selected_location = selected_location;
        // Only Done because bug in ng2-select
        this.addSelectBox.active = [selected_location];
        this.addSelectBox.ngOnInit();
        
        this.childModal.show();
    }

    public addRootNode(){
        this.childModal.show();
    }
    public editLocation(event){
        console.log('Tree Edit Node Click', event);
        this.location_edit = event;
        
        // Inject Initial Value to the Edit Form
        this.editForm.patchValue({ edit_name: event.data.name });
        this.editForm.patchValue({ edit_description: event.data.description });
        
        if(event.data.parentLocationId != null){
            if (this.editSelectBox) {
                
              let locations_data = this.locations;    
              let location_found = locations_data.filter(
                (locations_object) => {
                    return locations_object.locationId == event.data.parentLocationId;
                }
              );
              console.log('Location Found', location_found);
                
              this.location_edit.selected_location = {
                    id: event.data.parentLocationId,
                    text: location_found[0].name
              };
                
              // Only Done because bug in ng2-select
              this.editSelectBox.active = [this.location_edit.selected_location];
              this.editSelectBox.ngOnInit();
            }
        }
         
        console.log('Location Edit Initial Select:', this.location_edit.selected_location);
        this.editChildModal.show();
    }
    public deleteLocation(event){
        this.deleteConfirm = event;
        this.delete_name = event.name;
        
        this.deleteModal.show();
        console.log('Deleting Node', event);
        
        
        /*this.locations = this.locationService.getLocationsNormal();
        var temp_locations = JSON.parse(JSON.stringify(this.locations));
        this.treeLocations = [].concat(convertToTree(temp_locations));
        this.locations_tree.treeModel.update();*/
    }

    public saveDelete(){
        // Should call the Confirmation Modal first
        this.locationService.deleteLocation(this.deleteConfirm.data.locationId).subscribe(
            (data) => {
                console.log('Return Data', data);
                // Refresh
                this.ngOnInit();
            }
        );
        this.deleteModal.hide();
    }

    public hideModal(){
        this.editChildModal.hide();
        this.childModal.hide();
    }

    public cancel(){
        this.hideModal();
        
        // Maybe some other logic to reset the form
        // Clear all input in the form
        this.clearFormInputs(this.form);
                    
        
    }
    public clearFormInputs(form){
        form.reset();
    }
    public hideChildModal(){
        this.childModal.hide();
        this.editChildModal.hide();
    }
}
