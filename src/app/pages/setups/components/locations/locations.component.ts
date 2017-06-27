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

  public location_edit = {
    id: null,
    name: '',
    description: '',
    parent_location_id: null,
    selected_location: null
  };
  
  @ViewChild('editSelectBox') editSelectBox: SelectComponent;
  @ViewChild('childModal') childModal: ModalDirective;
  @ViewChild('editChildModal') editChildModal: ModalDirective;
  @ViewChild('addSelectBox') addSelectBox: SelectComponent;
  @ViewChild(TreeComponent)
  private locations_tree: TreeComponent;

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
      this.locations$ = this.locationService.getLocations();
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
        if(this.editForm.valid){
            
            var formatted_object = Object.assign({}, {
               id: this.location_edit.id,
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
    public editThisNode(event){
        console.log('Tree Edit Node Click', event);
        this.location_edit = event;
        
        // Inject Initial Value to the Edit Form
        this.editForm.patchValue({ edit_name: event.name });
        this.editForm.patchValue({ edit_description: event.description });
        
        if(event.parent_location_id != null){
            if (this.editSelectBox) {
              let location_found = this.locationService.get(event.parent_location_id);
              this.location_edit.selected_location = {
                    id: event.parent_location_id,
                    text: location_found.name
              };
                
              // Only Done because bug in ng2-select
              this.editSelectBox.active = [this.location_edit.selected_location];
              this.editSelectBox.ngOnInit();
            }
        }
         
        console.log('Location Edit Initial Select:', this.location_edit.selected_location);
        this.editChildModal.show();
    }
    public deleteThisNode(event){
        console.log('Deleting Node', event);
        this.locationService.deleteLocation(event.id);
        
        this.locations = this.locationService.getLocationsNormal();
        var temp_locations = JSON.parse(JSON.stringify(this.locations));
        this.treeLocations = [].concat(convertToTree(temp_locations));
        this.locations_tree.treeModel.update();
    }
    public hideChildModal(){
        this.childModal.hide();
        this.editChildModal.hide();
    }
}
