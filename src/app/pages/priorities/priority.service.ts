import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../global.state';
@Injectable()
export class PriorityService{
	private priority_data: any;
	redirectUrl: string;
    private appUrl = GlobalConfigs.APP_BASE_URL + '/master/'; //'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';

	constructor(private http: Http){

	}

	getPriorities(): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		var bearer = "Bearer " + localStorage.getItem('bearer_token');

		headers.append('Authorization', bearer);
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({headers: headers});
		var load_url = this.appUrl + 'wo-priority/all';
		console.log('Options ', options);

		return this.http.get(load_url, options).map(this.extractData);
	}

	addPriority(new_priority): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
		headers: headers
		});

		var add_url = this.appUrl + 'wo-priority/add';

		// To Change the JSON object to urlencoded
		let url_search_params = new URLSearchParams();

		url_search_params.append('name', new_priority.name);
		url_search_params.append('description', new_priority.description);
		url_search_params.append('escalationPeriodInDays', new_priority.escalationPeriodInDays);

		let priority_body = url_search_params.toString();
		console.log('expense Body URL encode', priority_body);
		return this.http.post(add_url, priority_body, options).map(this.extractData);
	  }

	updatePriority(update_priority){
		console.log('update priority',update_priority);
		var headers = new Headers();

		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var update_url = this.appUrl + 'wo-priority/update';

		 // To Change the JSON object to urlencoded
		  let url_search_params = new URLSearchParams();
		  url_search_params.append('woPriorityId', update_priority.id);
		  url_search_params.append('name', update_priority.name);
		  url_search_params.append('description', update_priority.description);
		  url_search_params.append('escalationPeriodInDays', update_priority.escalationPeriodInDays);

		  let priority_body = url_search_params.toString();

		  console.log('priority_body URL encode', priority_body);

		  return this.http.post(update_url, priority_body, options).map(this.extractData);

	}
	deletePriority(id): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var delete_url = this.appUrl + 'wo-priority/delete';

		var delete_body = "woPriorityId=" + id;
		console.log('test service delete', delete_body);
		return this.http.post(delete_url, delete_body, options).map(this.extractData);

	}

	private extractData(res: Response){
		let body = res.json();
		console.debug(body);
		return body || { };
	}
}
