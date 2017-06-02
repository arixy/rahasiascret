import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../global.state';
@Injectable()
export class UsersService{
	private user_data: any;
  	redirectUrl: string;
        //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/';
        private appUrl = GlobalConfigs.APP_BASE_URL + "/";

  constructor(private http: Http){
   
  }

	getUsers(): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		var bearer = "Bearer " + 	localStorage.getItem('bearer_token');

		headers.append('Authorization', bearer);
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({headers: headers});
		var load_url = this.appUrl + 'admin/user/all';
		console.log('Options ', options);

		return this.http.get(load_url, options).map(this.extractData);
	}

	addUsers(new_user): Observable<any> {
		console.log('test', new_user);
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
		headers: headers
		});

		var add_url = this.appUrl + 'admin/user/add';

		// To Change the JSON object to urlencoded
		let url_search_params = new URLSearchParams();

		url_search_params.append('leaderId', new_user.leaderId);
		url_search_params.append('username', new_user.username);
		url_search_params.append('fullname', new_user.fullname);
		url_search_params.append('email', new_user.email);
		url_search_params.append('mobilePhoneNumber', new_user.mobile_phone_number);
		url_search_params.append('password', new_user.password);
		url_search_params.append('password', new_user.password);

		let users_body = url_search_params.toString();
		console.log('expense Body URL encode', new_user);
		
		return this.http.post(add_url, new_user, options).map(this.extractData);
	}
	updateUsers(update_user){
		console.log('tets service', update_user);
		console.log('tets service', update_user);
		var headers = new Headers();  
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var update_url = this.appUrl + 'admin/user/update';

		// To Change the JSON object to urlencoded
		let url_search_params = new URLSearchParams();

		url_search_params.append('userId', update_user.id);
		url_search_params.append('username', update_user.username);
		url_search_params.append('email', update_user.email);
		url_search_params.append('mobile_phone_number', update_user.mobile_phone_number);
		url_search_params.append('password_salt', update_user.password_salt);
		url_search_params.append('hash_password', update_user.hash_password);

		let users_body = url_search_params.toString();

		console.log('expense_body URL encode', users_body);
		console.log('tets service', update_user);
		console.log('tets service', update_url);
		return this.http.post(update_url, update_user, options).map(this.extractData);

	}
	deleteUsers(id): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var delete_url = this.appUrl + 'admin/user/delete';

		var delete_body = "userId=" + id;
		console.log('test service delete', delete_body);
		return this.http.post(delete_url, delete_body, options).map(this.extractData);

	}

	private extractData(res: Response){
		let body = res.json();
		console.debug(body);
		return body || { };
	}
}
