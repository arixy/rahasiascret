import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs  } from '../../global.state';
@Injectable()
export class RoleService{
	private role_data: any;
	redirectUrl: string;
    //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/admin/';
    private appUrl = GlobalConfigs.APP_BASE_URL + '/admin/';

  constructor(private http: Http){
//    this.role_data = [
//        {
//            id: UUID.UUID(),
//            name: 'Manager',
//            description: 'Super Manager Roles',
//            role_type_id: UUID.UUID(),
//            //is_selected: true,
//           	is_active: true,
//            inactive_date: null,
//            date_created: '2017-01-01',
//            date_updated: '2017-01-01',
//            created_by: 1,
//            updated_by: null,
//        },
//		 {
//            id: UUID.UUID(),
//            name: 'Admin',
//            description: 'Only Administrative Stuff',
//            role_type_id: UUID.UUID(),
//           	is_active: true,
//            inactive_date: null,
//            date_created: '2017-01-01',
//            date_updated: '2017-01-01',
//            created_by: 1,
//            updated_by: null,
//        },
//    ];
  }

  getRole(): Observable<any> {
	  	var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		var bearer = "Bearer " + localStorage.getItem('bearer_token');

		headers.append('Authorization', bearer);
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({headers: headers});
		var load_url = this.appUrl + 'role/all';
		console.log('Options ', options);

		return this.http.get(load_url, 	options).map(this.extractData);
	}
	
    getRolesFilter(filter_data){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + 'role/all';
        
        let formatted_object = {
                filters: {},
                first: 0,
                rows: 10,
                globalFilter: '',
                multiSortMeta: null,
                sortField: 'dateUpdated',
                sortOrder: -1
        };
        if(filter_data){
           formatted_object = filter_data; 
        }
        console.log('Formatted_Object', formatted_object);
        return this.http.post(load_url, formatted_object, options).map(this.extractData);
    }
  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
    
  addRole(new_role): Observable<any> {
      console.log('test role service',new_role);
      var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var add_url = this.appUrl + 'role/add';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('name', new_role.name);
      url_search_params.append('description', new_role.description);
	  
      let role_body = url_search_params.toString();
      console.log('utility Body URL encode', role_body);
      return this.http.post(add_url, role_body, options).map(this.extractData);
  }
    updateRole(update_role){
		console.log('Editing', update_role);
        var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      	headers.append('Access-Control-Allow-Origin', '*');
      	headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      	var options = new RequestOptions({
			headers: headers
		});
      
      
      	var update_url = this.appUrl + 'role/update';
      
      	// To Change the JSON object to urlencoded
      	let url_search_params = new URLSearchParams();
      
      	url_search_params.append('roleId', update_role.id);
      	url_search_params.append('name', update_role.name);
      	url_search_params.append('description', update_role.description);
      
      	let role_body = url_search_params.toString();
      
      	console.log('expense_body URL encode', role_body);
      
      	return this.http.post(update_url, role_body, options).map(this.extractData);
    }

    deleteRole(id): Observable<any> {
        var headers = new Headers();
      
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
		var options = new RequestOptions({
			headers: headers
		});
      
      	var delete_url = this.appUrl + 'role/delete';
      
      	var delete_body = "roleId=" + id;
      	console.log('service delete', delete_body);
      	return this.http.post(delete_url, delete_body, options).map(this.extractData);
    }
    
    
    getRoleNormal(){
        return this.role_data;
    }
}
