import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { UsersService } from './users.service';
import { UsersRolesService } from './../users-role/users-roles.service';
import { RoleService } from './../role/role.service';
import { DataTable } from 'primeng/primeng';
import { saveAs } from 'file-saver';
import { DialogsService } from './../../services/dialog.service';
import { GrowlMessage, MessageSeverity, MessageLabels } from '../../popup-notification';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent {

    public users;
    public users$: Observable<any>;
    public roles$: Observable<any>;
    public processed_roles;
    public loaded_roles = [];
    public leaderId = 1;
    public selected_user = null;
    private totalRecords;
    
    public form;
    public username;
    public fullname;
    public email;
    public mobilePhoneNumber;
    public password;
	public submitted;
    
	public edit_form;
	public edit_username;
	public edit_fullname;
	public edit_email;
	public edit_leaderId;
	public edit_mobilePhoneNumber;
	public edit_password;
	public user_edit;

    public add_form_submitted = false;
    public edit_form_submitted = false;
    public disabled = false;

	new_users;
	deleteConfirm;
	delete_name;

    add_roles = [];
    edit_roles = [];

    // Filtering Stuffs 
    filter_username_fc = new FormControl();
    filter_fullname_fc = new FormControl();
    filter_email_fc = new FormControl();
    filter_mobile_fc = new FormControl();

    // Loading States
    dataLoading = false;
    submitLoading = false;

    filter_master = {
        "username": {
            "matchMode": "undefined",
            "value": ""
        },
        "fullname": {
            "matchMode": "undefined",
            "value": ""
        },
        "email": {
            "matchMode": "undefined",
            "value": ""
        },
        "mobilePhoneNumber": {
            "matchMode": "undefined",
            "value": ""
        }
  };

    public error_from_server = [];
    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
    @ViewChild('rolesModal') rolesModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;
    @ViewChild('dt') usersTable: DataTable;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public usersService: UsersService,
    public usersRolesService: UsersRolesService,
    public roleService: RoleService,
    public dialogsService: DialogsService
    ) {
        // Add New Form
       this.form = fb.group({
          'username': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
		  'fullname': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'email': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'mobilePhoneNumber': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'password': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          });
	  
        this.username = this.form.controls['username'];
	  	this.fullname = this.form.controls['fullname'];
        this.email = this.form.controls['email'];
        this.mobilePhoneNumber = this.form.controls['mobilePhoneNumber'];
        this.password = this.form.controls['password'];
       
	  //edit form
	  this.edit_form = fb.group({
		   'edit_username': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
		   'edit_fullname': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'edit_email': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'edit_mobilePhoneNumber': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
          'edit_password': ['', Validators.compose([Validators.required, Validators.minLength(2)])],
       });
	  this.edit_username = this.edit_form.controls['edit_username'];
	  this.edit_fullname = this.edit_form.controls['edit_fullname'];
	  this.edit_email = this.edit_form.controls['edit_email'];
	  this.edit_mobilePhoneNumber = this.edit_form.controls['edit_mobilePhoneNumber'];
	  this.edit_password = this.edit_form.controls['edit_password'];
        // Test Moment
        var now = moment(new Date()); //todays date
        var end = moment("2015-12-1"); // another date
        var duration = moment.duration(now.diff(end));
        var days = duration.asDays();
    	console.log(days);
        
       
  }

	ngOnInit(){
		 /*this.usersService.getUsers().subscribe(
            data => {
                this.users = data.data;
				console.log('data user',data);
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
            }
        );	*/
        
	}
	
    ngAfterViewInit(){
        console.log('This UsersTable', this.usersTable);
        
        // Set manual filter debounce
        this.filter_username_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.username = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.usersTable);
                }
                
            );
        
        this.filter_fullname_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.fullname = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.usersTable);
                }
                
            );
        
        this.filter_email_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.email = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.usersTable);
                }
                
            );
        
        this.filter_mobile_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.mobilePhoneNumber = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.usersTable);
                }
                
            );
        
        this.refresh(this.filter_master, this.usersTable);
        
    }
    refresh(filter_master, table: DataTable){
        
        this.dataLoading = true;
        
        // The only custom element is the filter master since we want to implement debounce
        var formatted_object = {};
        
        if(table == null){
            formatted_object = {
                filters : filter_master,
                first: 0,
                rows: 10,
                globalFilter: "",
                multiSortMeta: null,
                sortField: 'dateUpdated',
                sortOrder: -1
            }
        } else {
            formatted_object = {
                filters : filter_master,
                first: table.first,
                rows: table.rows,
                globalFilter: table.globalFilter,
                multiSortMeta: table.multiSortMeta,
                sortField: table.sortField,
                sortOrder: table.sortOrder    
            }
            
        }
        
        console.log('Shoot Refresh', formatted_object);
        this.usersService.getUsersFilter(formatted_object).subscribe(
            (response) => {
                this.dataLoading = false;
                console.log('Refresh Data', response);
                this.users = response.data;

                if(response.paging != null){
                    this.totalRecords = response.paging.total;
                } else {
                    this.totalRecords = 0;
                }
            }
        );
    }

	 public hideChildModal(){
         this.addNewModal.hide();
    }
	public deleteClose(){
		this.deleteModal.hide();
	}
    public deleteUsers(event){
		this.deleteConfirm= event;
		this.delete_name= event.fullname;
		
        this.dialogsService.confirmDelete(this.delete_name, 'Test').subscribe(
            (response) => {
                if(response == true){
                    this.saveDelete();
                }
            }
        );
		console.log('delete', event);
		console.log('delete', event.fullname);
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);	this.usersService.deleteUsers(this.deleteConfirm.userId).subscribe(
            (data) => {
                console.log('Return Data', data);
                if(data.resultCode.code == 0){
                    // Growl Message Success
                    GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.DELETE_SUCCESS);
                    this.refresh(this.filter_master, this.usersTable);    
                } else {
                    // Error
                    let error_delete = [];
                    error_delete = error_delete.concat(data.resultCode.message);
                    GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.DELETE_ERROR + '. ' + error_delete[0]);
                    
                }
            }
        );
		this.deleteModal.hide();
	}
    public addUsers(){
        
        this.roleService.getRole().subscribe(
            (role_data) => {
                this.loaded_roles = role_data.data;
                console.log('Loaded Roles', this.loaded_roles);
                
            }
        );
        
        this.addNewModal.show();
    }
    
    public editUsers(event){
        console.log('editing', event);
        this.disabled = false;
        this.edit_form.enable();
        
		this.user_edit = event.userId;
        
        // Actually Call the Get Individual User
        this.usersService.get(this.user_edit).subscribe(
            (response) => {
                let user_data = response.data.user;
                let user_roles = response.data.roles;
                
                console.log('User data from Get', response);
                
                // Inject Initial Value to the Edit Form
                this.edit_form.patchValue(
                    {
                        edit_username: user_data.username,
                        edit_fullname: user_data.fullname,
                        edit_email: user_data.email,
                        edit_mobilePhoneNumber: user_data.mobilePhoneNumber,
                        edit_password: user_data.password
                    }
                );
                
                this.roleService.getRole().subscribe(
                    (role_data) => {
                        this.loaded_roles = role_data.data;
                        this.loaded_roles = this.loaded_roles.map(
                            (edit_role) => {
                                let user_role_found = user_roles.find(
                                    (role_of_user) => {
                                        return role_of_user.roleId == edit_role.roleId;
                                    }
                                );
                                
                                if(user_role_found != undefined){
                                    edit_role.is_selected = true;
                                } else {
                                    edit_role.is_selected = false;
                                }
                                
                                return edit_role;
                            }
                        );
                        
                        // Make an Integer Representation of loaded roles
                        this.loaded_roles.forEach(
                            (loaded_role) => {
                                if(loaded_role.is_selected == true){
                                    this.edit_roles.push(loaded_role.roleId);
                                }
                            }
                        );
                        console.log('Loaded Roles after filteringt', this.loaded_roles);
                    }
                );
                /*this.edit_form.patchValue({ edit_username: event.username });
                this.edit_form.patchValue({ edit_fullname: event.fullname });
                this.edit_form.patchValue({ edit_email: event.email });
                this.edit_form.patchValue({ edit_mobilePhoneNumber: event.mobilePhoneNumber });

                this.edit_form.patchValue({ edit_password: event.password });*/
            }
        );
        
		
		
        // Prepare Roles Checkbox
        // TODO: Doesn't this need to use processed_roles instead?
        this.selected_user = event;
        /*this.roleService.getRole().subscribe(
            (role_data) => {
                this.loaded_roles = role_data.data;
                console.log('Loaded Roles', this.loaded_roles);
                
                // Process Data for potential matching with users
                this.processed_roles = this.usersRolesService.processRolesOfUser(this.selected_user, this.loaded_roles);
                console.log('Processed Roles:', this.processed_roles);
            }
        );
        console.log('Users', this.selected_user);*/
        
        // Display Form Modal
        this.editModal.show();
    }

    public viewUsers(event){
        console.log('Viewing', event);
        
		this.user_edit = event.userId;
        
        // Actually Call the Get Individual User
        this.usersService.get(this.user_edit).subscribe(
            (response) => {
                let user_data = response.data.user;
                let user_roles = response.data.roles;
                
                console.log('User data from Get', response);
                
                // Inject Initial Value to the Edit Form
                this.edit_form.patchValue(
                    {
                        edit_username: user_data.username,
                        edit_fullname: user_data.fullname,
                        edit_email: user_data.email,
                        edit_mobilePhoneNumber: user_data.mobilePhoneNumber,
                        edit_password: user_data.password
                    }
                );
                
                this.roleService.getRole().subscribe(
                    (role_data) => {
                        this.loaded_roles = role_data.data;
                        this.loaded_roles = this.loaded_roles.map(
                            (edit_role) => {
                                let user_role_found = user_roles.find(
                                    (role_of_user) => {
                                        return role_of_user.roleId == edit_role.roleId;
                                    }
                                );
                                
                                if(user_role_found != undefined){
                                    edit_role.is_selected = true;
                                } else {
                                    edit_role.is_selected = false;
                                }
                                
                                return edit_role;
                            }
                        );
                        
                        // Make an Integer Representation of loaded roles
                        this.loaded_roles.forEach(
                            (loaded_role) => {
                                if(loaded_role.is_selected == true){
                                    this.edit_roles.push(loaded_role.roleId);
                                }
                            }
                        );
                        console.log('Loaded Roles after filteringt', this.loaded_roles);
                    }
                );
            }
        );
        
		
		
        // Prepare Roles Checkbox
        // TODO: Doesn't this need to use processed_roles instead?
        this.selected_user = event;
        
        // Display Form Modal
        this.disabled = true;
        this.edit_form.disable();
        this.editModal.show();
    }

    public onSubmit(values){
		console.log('event', event);
       this.submitted = true;
        
        this.add_form_submitted = true;
        
		if(this.form.valid){
            this.submitLoading = true;
			 console.log('Form Values uti:', values.id);
			 console.log('Form Values uti:', values.leaderId);
			 var formatted_object = Object.assign({}, {
				leaderId: this.leaderId,
                username: values.username,
                fullname: values.fullname,
                email: values.email,
                mobilePhoneNumber: values.mobilePhoneNumber,
                password: values.password,
				roles: this.add_roles
              });
			
			 this.usersService.addUser(formatted_object).subscribe(
				(data) => {
					console.log('Return Data test', data);
                    this.submitLoading = false;
					if(data.resultCode.code == 0){
                        
                        console.log('Success!');
                        this.clearFormInputs(this.form);
                        
                        // Success Message
                        GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                        
                        this.addNewModal.hide();
                        // Refresh Data
                        this.refresh(this.filter_master, this.usersTable);
                        
                    } else {
                        // Error
                        this.error_from_server = [];
                        this.error_from_server = this.error_from_server.concat(data.resultCode.message);
                    }
				}
			);	
			
		}
	}
    
  	public onSubmitEdit(values,event){
		console.log('edit form',values);
        
        this.edit_form_submitted = true;
		if(this.edit_form.valid){
//			 var formatted_object = Object.assign({}, {
//                userId: this.user_edit,
//                leaderId: this.leaderId,
//                username: values.edit_username,
//                fullname: values.edit_fullname,
//                email: values.edit_email,
//                mobilePhoneNumber: values.edit_mobilePhoneNumber,
//                password: values.edit_password,
//				roles: this.loaded_roles
//              });
//			console.log('formatted_object',formatted_object);
			this.new_users = {
				userId: this.user_edit,
				username: values.edit_username,
                fullname: values.edit_fullname,
				password: values.edit_password,
				email: values.edit_email,
				mobilePhoneNumber: values.edit_mobilePhoneNumber,
				leaderId: 1,
				roles: this.edit_roles
			}
            this.usersService.updateUsers(this.new_users).subscribe(
                (response) => {
                    console.log('Response from Update User', response);
                }
            );
			
			console.log('After Edit User.. ', this.users);
            //console.log(response);
             this.editModal.hide();
		}
    }
    
    /*public roles(users){
        this.selected_user = users;
        this.rolesModal.show();
        this.roleService.getRole().subscribe(
            (role_data) => {
                this.loaded_roles = role_data;
                console.log('Loaded Roles', this.loaded_roles);
                // Process Data for potential matching with users
                this.processed_roles = this.usersRolesService.processRolesOfUser(users, this.loaded_roles);
                console.log('Processed Roles:', this.processed_roles);
            }
        );
        console.log('Users', users);
    }*/
     
    public onRoleChange(user,role, roles_array){
        console.log('Checked Role', role);
        console.log('Checked User', user);
        if(role.is_selected == true){
            roles_array.push(role.roleId);
        } else {
            roles_array.splice(roles_array.indexOf(role.roleId), 1);
        }
        console.log('Roles Array', roles_array);
        //this.usersRolesService.updateUsersRoles(user, role);
    }

    public hasValueError(roles_array){
        if(roles_array.length == 0){
            return { required: true };
        }
        return {};
    }

    public hideModal(){
        this.addNewModal.hide();
        this.editModal.hide();
    }

    public clearFormInputs(form){
        form.reset();
    }

    public cancel(){
        this.hideModal();
        
        // TODO: Logic to reset the form
        this.clearFormInputs(this.form);
    }

    public resetFilters(table){
        
        // Clear all filter in filter master. Might be Redundant
        this.filter_master.username.value = "";
        this.filter_master.fullname.value = "";
        this.filter_master.email.value = "";
        this.filter_master.mobilePhoneNumber.value = "";
        
        // Actually changing the value on the input field. Auto Refresh
        this.filter_username_fc.setValue("");
        this.filter_fullname_fc.setValue("");
        this.filter_email_fc.setValue("");
        this.filter_mobile_fc.setValue("");
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
        this.usersService.getCSV(formatted_object).subscribe(
            (data) => {
                this.dataLoading = false;
                console.log('Refresh Data', data);
                this.downloadFile(data);
            }
        );
    }
    
    private downloadFile(data: Response){
        var blob = new Blob([data.blob()], { type: data.headers.get('Content-Type') });
        saveAs(blob, 'users.csv');
    }
}  
