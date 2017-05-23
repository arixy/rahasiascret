import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { RoleService } from './../role/role.service';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class UsersRolesService{
  private users_roles_data: any;

  redirectUrl: string;

  constructor(private http: Http,
              private roleService: RoleService){
    this.users_roles_data = [
    ];
  }

  getUsers(): Observable<any> {
    
    return Observable.of(this.users_roles_data);
  }

  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
    
  
    updateUsersRoles(user, role){
        console.log('Role Update:', role);
        console.log('User Update:', user);
        let user_role_object = {
            id: UUID.UUID(),
            user_id: user.id,
            role_id: role.id
        }
        console.log('New UR object', user_role_object);
        // Check Entry Combination exists of not
        let filtered_user_role = this.users_roles_data.filter(
            (user_role) => {
                return (user_role.user_id == user_role_object.user_id) && (user_role.role_id == user_role_object.role_id);
            }
        );
        console.log('Filtered User ROle', filtered_user_role);
        if(role.is_selected == true){
            // Needs to either PUSH or NOT
            console.log('Pushing');
            if(filtered_user_role.length <= 0){
                this.users_roles_data = this.users_roles_data.push(user_role_object);
                console.log('before push',user_role_object)
                console.log('Pushed');
            }
            
        } else {
            // Needs to either FILTER or NOT
                this.users_roles_data = this.users_roles_data.filter(
                    (user_role) => {
                        return (user_role.user_id != user_role_object.user_id) || (user_role.role_id != user_role_object.role_id);
                    }
                );
        }
        console.log('Updated User Role', this.users_roles_data);
    }
    
    
    
    getUsersRolesNormal(){
        return Object.assign({}, this.users_roles_data);
    }
    getRolesOfUser(user){
        
        // Return Array of Roles or null
        
        let roles_id = this.users_roles_data.filter(
            (users_roles_data) => {
                return users_roles_data.user_id == user.id;
            }
        );
        if(roles_id.length <= 0){
            return null;
        }
        return roles_id;
    }
    getUsersOfRole(role){
        return [];
    }
    processRolesOfUser(user, roles){
        let user_roles = this.getRolesOfUser(user);
        if(user_roles == null){
            // Unmodified Roles
            return roles;
        } 
        let processed_roles = roles.map(
            (role_from_all) => {
                let found_role = user_roles.find(
                    (user_role_id) => {
                        user_role_id == role_from_all.id;
                    }
                );
                if(found_role != undefined){
                    return Object.assign({}, role_from_all, {
                        is_selected: true
                    });
                } else {
                    return Object.assign({}, role_from_all, {
                        is_selected: false
                    });
                }
            }
        );
        // Return roles
        return processed_roles;
    }
}
