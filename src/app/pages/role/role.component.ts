import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation,ViewChildren,QueryList} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, FormControl } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { RoleService } from './role.service';
import { DataTable } from 'primeng/primeng';
import { FilterInputComponent } from '../filter-input.component';
import { Subscription }   from 'rxjs/Subscription';
import { GlobalConfigs } from '../../../global.state';
import { SelectComponent, SelectItem } from 'ng2-select';

@Component({
  selector: 'utility-types',
  templateUrl: './role.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss']
  
})
export class RoleComponent {

    private errMsg=[];
    private errMsgList=[];
    private lstRole;

    // column
    private roleId;
    private roleName;
    private roleDecsription;
    private roleTypeId;

    private roleFilterMaster : any = {};

    private isSpinerLoading=false;

    private readonly DEFAULT_ITEM_PER_PAGE : number = 10;
    private readonly DEFAULT_SORT_FIELD : string = "name";
    
    @ViewChild("dt") dataTabel:DataTable;
    @ViewChildren("rolefilter") rolefilter : QueryList<FilterInputComponent>;
    
    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
    @ViewChild('deleteModal') deleteModal:ModalDirective;

    @ViewChild('addRoleTypeSelectBox') addRoleTypeSelectBox: SelectComponent;
    @ViewChild('editRoleTypeSelectBox') editRoleTypeSelectBox: SelectComponent;	
    public items_roletype;
    
    
    
    private form;
    private name;
    private description;

    
    private edit_form;
    private viewTittle;
    private errMsgEdit=[];
    private edit_name;
    private edit_description;
    private isVisible;
    private isDisabled;
    public  utilityRoleId;
    public  utilityRoleTypeId;

    private deleteConfirm;
    private delete_name;
    
    private submitLoading;
    private subscription: Subscription;

    private totalRecords;
    public roleType: Observable<any>;

    public selected_typeid = null;
    public selected_typeid_edit = null;
    public selectedRoleFc;



    constructor(
        public fb: FormBuilder,
        public cdr: ChangeDetectorRef,
        public roleService: RoleService
    ) 
    {
        this.subscription=this.roleService.eventEmitted$.subscribe(event=>{
            
            if (event == "addNewModal_btnSaveOnClick_createSuccess" || event == "addNewModal_btnSaveOnClick_updateSuccess") {
                this.hideChildModal();
                this.getAllRole(this.builderFilterRole(this.dataTabel,this.roleFilterMaster));
            }else if(event=="deleteModal_btnSaveOnClick_deleteSuccess"){
                this.getAllRole(this.builderFilterRole(this.dataTabel,this.roleFilterMaster));
            }

        });

        this.form = this.fb.group({
            'name': ['', [Validators.required, Validators.minLength(2)]],
            'description': ['', [Validators.required, Validators.minLength(2)]],
            'selectedRoleFc': ['', Validators.compose([Validators.required])]
		  });
          this.name = this.form.controls['name'];
		  this.description = this.form.controls['description'];
          this.selectedRoleFc = this.form.controls['selectedRoleFc'];

		  this.edit_form = this.fb.group({
              'edit_name' : ['', [Validators.required,Validators.minLength(2)]],
              'edit_description' : ['', [Validators.required,Validators.minLength(2)]]
          });
			this.edit_name = this.edit_form.controls['edit_name'];
            this.edit_description = this.edit_form.controls['edit_description'];
            // Test Moment
            
		  var now = moment(new Date()); //todays date
		  var end = moment("2015-12-1"); // another date
		  var duration = moment.duration(now.diff(end));
		  var days = duration.asDays();

		  console.log(days);

          this.isVisible=false;

    }

    public ngOnInit(){
		
		
         this.roleType=this.roleService.getAllRoleTypes(); 
         this.roleType.subscribe(
            (data) => {
                this.items_roletype = data.data;
                this.items_roletype = this.items_roletype.map(
                    (roleType) => {
                        return Object.assign({}, {
                            id: roleType.roleTypeId,
                            text: roleType.name
                        });
                    }
                  );
                
            }
          );

	}

    public addRole(){
        this.addNewModal.show();
    }

    public refreshRole($event, table){
        console.log();
		this.getAllRole(this.builderFilterRole(table,this.roleFilterMaster));
    }

    public builderFilterRole(dateTabelRole:DataTable,roleFilterMaster:any){
        
        if(dateTabelRole==null){
            return {
                "filters": {},
                "first": 0,
                "rows": this.DEFAULT_ITEM_PER_PAGE,
                "globalFilter": "",
                "multiSortMeta": null,
                "sortField": this.DEFAULT_SORT_FIELD,
                "sortOrder": -1
            }
        }else{
            return {
                "filters": roleFilterMaster,
                "first": dateTabelRole.first,
                "rows": dateTabelRole.rows,
                "globalFilter": dateTabelRole.globalFilter,
                "multiSortMeta": dateTabelRole.multiSortMeta,
                "sortField": dateTabelRole.sortField,
                "sortOrder": dateTabelRole.sortOrder
            }
        }

    }
    public downloadRoleCSV(dataTabelRole:DataTable){
        
        let filters:any=this.builderFilterRole(dataTabelRole,this.roleFilterMaster);
        filters.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("export CSV");
        this.roleService.getDownloadCSV(filters).subscribe(
            (data)=>{
                var dataCsv= new Blob([data.blob()], {type: 'text/csv;charset=utf-8;'});
                var urlCsv=window.URL.createObjectURL(dataCsv);
                var link = document.createElement('a');
                
                link.setAttribute('href', urlCsv);
                link.setAttribute('download', "Role.csv");
                link.click();
        
            }
        );
    }

    public resetFiltersRole(dataTabelRole:DataTable){
        // removed value 
        this.rolefilter.forEach(element => {
			 element.resetFilter();
		});

        this.roleFilterMaster={};
        this.getAllRole(this.builderFilterRole(dataTabelRole,this.roleFilterMaster));
    }


    public getAllRole(filters){
        console.log("filters ",filters);
        console.log("roleFilterMaster :{}",this.roleFilterMaster);
         this.isSpinerLoading=true;
        this.roleService.getRoleByFilter(filters).subscribe((response)=>{
            if(response.resultCode.code==0){
            
                this.lstRole =response.data;
            }else{
                // error
                this.errMsgList=[];
                this.errMsgList=this.errMsgList.concat(response.resultCode.message);
                this.isSpinerLoading = false;
            }

            // pagging 
            if(response.paging != null)
                this.totalRecords = response.paging.total;
            else
                this.totalRecords = 0;

             this.isSpinerLoading = false;

        });
    }
     
    /**
     * 
     * @param (onFilter)=onRolefilter(objEvent)
     *  Object {matchMode: undefined, value: ""}
     *  name  :{matchMode: undefined, value: ""}
     */
    public onRolefilter(event){
        console.log("field ",event.field);
        console.log("value ",event.value);
        this.roleFilterMaster[event.field]=event.value;
        this.refreshRole(event,this.dataTabel);
        
    }

    // update, delete, edit 
    public hideChildModal(){
		this.addNewModal.hide();
		this.editModal.hide();
		this.clearFormInput(this.form);
    }
    public hideModal(){
		this.addNewModal.hide();
        this.editModal.hide();
        this.clearFormInput(this.form);
       
	}
    public clearFormInput(form){
        form.reset();
        this.addRoleTypeSelectBox.active = [];
        this.editRoleTypeSelectBox.active = [];
	}

    public onSubmit(values){
        
        var hasError = false;
        if(!this.form.valid){
             this.markAsTouchAll();
             hasError=true;
        }
        if(hasError){
             return ;
        }
        
        this.submitLoading = true;
        if(this.form.valid){
              console.log('Form Values uti:', values);
              console.log("role type id ",this.selected_typeid.id);

              let roleValues={
                roleTypeId:this.selected_typeid.id,
                name:this.name.value,
                description:this.description.value
              };

              this.roleService.addRole(roleValues).subscribe(
                 (response) => {
                     if(response.resultCode.code==0){
                         this.submitLoading = false;
                         this.roleService.announceEvent("addNewModal_btnSaveOnClick_createSuccess");
                     }else{
                         this.errMsg=[];
                         this.errMsg=this.errMsg.concat(response.resultCode.message);
                         this.submitLoading = false;
                     }
                 }
             );
             
        }
        // 
     }



    public markAsTouchAll(){
		Object.keys(this.form.controls).forEach(key => {
            this.form.controls[key].markAsTouched();
            
        });
        
    }
    public cancel(){
		this.hideModal();
		this.clearFormInput(this.form);
    }
    public deleteClose(){
        this.deleteModal.hide();
    }

    
    public editRole(event){
    
        this.viewTittle="Edit Role Type";
        this.edit_form.enable();

        this.utilityRoleId = event.roleId;
        this.roleService.getRoleById(event.roleId).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.edit_form.patchValue({
                    'edit_name': response.data.role.name,
                    'edit_description': response.data.role.description
                });
                
                if (this.editRoleTypeSelectBox) {
                    
                    let name;
                    let typeId;
                    for(var i=0; i<this.items_roletype.length; i++){
                            if(this.items_roletype[i].text==event.roleTypeName){
                                typeId=this.items_roletype[i].id;
                                name=event.roleTypeName;
                                break;
                            }
                    }
                    this.selected_typeid_edit=typeId;
                    this.editRoleTypeSelectBox.active = [{id: typeId,text: name}];
            }

            }else{
                this.errMsgEdit=[];
                this.errMsgEdit=this.errMsgEdit.concat(response.data.message);
            }
        });
        this.isDisabled=false;
		this.isVisible=false;
		this.editModal.show();
		
    }

    public onSubmitEdit(values,event){
		console.log('edit form',values)
		this.viewTittle="Edit Role Type";
		  var hasError=false;
		  if(!this.edit_form.valid){
		 	    this.markAsTouchAllFormEdit();
		 	    hasError=true;
		  }

		  if(hasError){
		     	return;
		  }
		 this.submitLoading = true;
		 if(this.edit_form.valid){
			
            // parsing parameter to same value
			var formatted_object = Object.assign({}, {
                roleId: this.utilityRoleId,
                roleTypeId:this.selected_typeid_edit,
                name: values.edit_name,
                description: values.edit_description,
            });
		      this.hideChildModal();
             
              let response = this.roleService.updateRole(formatted_object).subscribe(
                 (data) => {
			 		if(data.resultCode.code==0){
						
			 			this.submitLoading = false;
                         // refresh data
                         this.roleService.announceEvent("addNewModal_btnSaveOnClick_updateSuccess");
			 		}else{
                         this.submitLoading = false;
			 			this.errMsgEdit=[];
			 			this.errMsgEdit=this.errMsgEdit.concat(data.data.message);
				
			 		}
                 }
              );  
            
         }
         this.submitLoading = false;	
    }

    private markAsTouchAllFormEdit(){
		Object.keys(this.edit_form.controls).forEach(key => {
			this.edit_form.controls[key].markAsTouched();
		});
	}
    
    public viewRole(event){
        
		this.viewTittle="View Role Type";
		this.edit_form.disable();
		
        this.utilityRoleId = event.roleId;
        this.roleService.getRoleById(event.roleId).subscribe(response => {
            if (response.resultCode.code == "0") {
                this.edit_form.patchValue({
                    'edit_name': response.data.role.name,
                    'edit_description': response.data.role.description
                });
                
                if (this.editRoleTypeSelectBox) {
                    
                    let name;
                    let typeId;
                    for(var i=0; i<this.items_roletype.length; i++){
                            if(this.items_roletype[i].text==event.roleTypeName){
                                typeId=this.items_roletype[i].id;
                                name=event.roleTypeName;
                                break;
                            }
                    }
                    this.selected_typeid_edit=typeId;
                    this.editRoleTypeSelectBox.active = [{id: typeId,text: name}];
                    this.editRoleTypeSelectBox.ngOnInit();
                
                }
            }else{
                this.errMsgEdit=[];
                this.errMsgEdit=this.errMsgEdit.concat(response.data.message);
            }
        });
        this.isDisabled=true;
		this.isVisible=true;
		this.editModal.show();
    }

    // group edit 
    public deleteRole(lstRole){
        this.deleteConfirm= lstRole;
		this.delete_name= lstRole.name;
		this.deleteModal.show();
    }

    public saveDelete(){
        this.submitLoading=true;
		console.log('test', this.deleteConfirm.userId);
			this.roleService.deleteRole(this.deleteConfirm.roleId).subscribe(
            (data) => {
                this.roleService.announceEvent("deleteModal_btnSaveOnClick_deleteSuccess");
                this.submitLoading=false;
            }
		);
		this.submitLoading=false;
		this.deleteModal.hide();
    }


    public selectedRoleType(value: any){
        console.log('Selected value:', value);
        this.selected_typeid = value;
        this.selectedRoleFc.setValue(value);
    }
	
	  public removedWOCategory(value: any){
        this.selected_typeid = value;
        this.selectedRoleFc.setValue(value);
 
    }
	
	 public typed(value: any){
        console.log('New Search Input:', value);
    }

    public selectedRoleTypeEdit(value){
        console.log("value.id  ",value.id);
        this.selected_typeid_edit = value.id;
    }

    //
}  
