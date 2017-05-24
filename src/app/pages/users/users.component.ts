import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ModalDirective } from 'ng2-bootstrap';
import * as moment from 'moment';
import { UsersService } from './users.service';
import { UsersRolesService } from './../users-role/users-roles.service';
import { RoleService } from './../role/role.service';

@Component({
  selector: 'expense-types',
  templateUrl: './users.component.html',
  styleUrls: ['./../styles/basic-theme.scss', './../styles/primeng.min.css', './../styles/modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent {

    public users;
    public users$: Observable<any>;
    public roles$: Observable<any>;
    public processed_roles;
    public loaded_roles=[];
    public leaderId= 1;
    public selected_user = null;
    
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
	new_users;
	deleteConfirm;
	delete_name;

    @ViewChild('addNewModal') addNewModal: ModalDirective;
    @ViewChild('editModal') editModal: ModalDirective;
    @ViewChild('rolesModal') rolesModal: ModalDirective;
	@ViewChild('deleteModal') deleteModal: ModalDirective;

  constructor(
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef,
    public usersService: UsersService,
    public usersRolesService: UsersRolesService,
    public roleService: RoleService
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
		 this.usersService.getUsers().subscribe(
            data => {
                this.users = data.data;
				console.log('data user',data);
                //this.processed_work_orders = this.injectDuration(JSON.parse(JSON.stringify(this.work_orders)));
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
		this.deleteModal.show();
		console.log('delete', event);
		console.log('delete', event.fullname);
	}
	public saveDelete(){
		console.log('test', this.deleteConfirm.userId);	this.usersService.deleteUsers(this.deleteConfirm.userId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.ngOnInit();
            }
        );
		this.deleteModal.hide();
	}
    public addUsers(){
        
//        this.roleService.getRole().subscribe(
//            (role_data) => {
//                this.loaded_roles = role_data.data;
//                console.log('Loaded Roles', this.loaded_roles);
//                
//            }
//        );
        
        this.addNewModal.show();
    }
    
    public editUsers(event){
        console.log('editing', event);
        
		this.user_edit = event.userId;
		// Inject Initial Value to the Edit Form
		this.edit_form.patchValue({ edit_username: event.username });
		this.edit_form.patchValue({ edit_fullname: event.fullname });
		this.edit_form.patchValue({ edit_email: event.email });
		this.edit_form.patchValue({ edit_mobilePhoneNumber: event.mobilePhoneNumber });
		
		this.edit_form.patchValue({ edit_password: event.password });
		
        // Prepare Roles Checkbox
        // TODO: Doesn't this need to use processed_roles instead?
        this.selected_user = event;
        this.roleService.getRole().subscribe(
            (role_data) => {
                this.loaded_roles = role_data.data;
                console.log('Loaded Roles', this.loaded_roles);
                
                // Process Data for potential matching with users
                this.processed_roles = this.usersRolesService.processRolesOfUser(this.selected_user, this.loaded_roles);
                console.log('Processed Roles:', this.processed_roles);
            }
        );
        console.log('Users', this.selected_user);
        
        // Display Form Modal
        this.editModal.show();
    }
    public onSubmit(values){
		console.log('event', event);
       this.submitted = true;
		if(this.form.valid){
			 console.log('Form Values uti:', values.id);
			 console.log('Form Values uti:', values.leaderId);
			 var formatted_object = Object.assign({}, {
				leaderId: this.leaderId,
                username: values.username,
                fullname: values.fullname,
                email: values.email,
                mobilePhoneNumber: values.mobilePhoneNumber,
                password: values.password,
				roles: this.loaded_roles
              });
			
			 this.usersService.addUsers(formatted_object).subscribe(
				(data) => {
					console.log('Return Data test', data);
					if(data.resultCode.code == 0){
                        console.log('Success!');
                        this.addNewModal.hide();
                        // Refresh Data
                        this.ngOnInit();
                        
                    } else {
                        // Fail
                        this.error_from_server = data.resultCode.message;
                        // No Need to Close the Modal or Refresh Data
                    }
				}
			);	
			
		}
	}
    
  	public onSubmitEdit(values,event){
		console.log('edit form',values);
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
			this.new_users ={
				userId: this.user_edit,
				username: values.edit_username,
                fullname: values.edit_fullname,
				password: values.edit_password,
				email: values.edit_email,
				mobilePhoneNumber: values.edit_mobilePhoneNumber,
				leaderId: this.leaderId,
				roles: this.loaded_roles
			}
			 let response = this.usersService. updateUsers(this.new_users);
			
			console.log('After Edit User.. ', this.users);
            //console.log(response);
             this.editModal.hide();
		}
    }
    
    public roles(users){
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
    }
     
    public onRoleChange(user,role){
        console.log('Checked Role', role);
        this.usersRolesService.updateUsersRoles(user, role);
    }
}  
