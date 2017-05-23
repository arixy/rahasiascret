import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class UtilityTypesService{
	private utility_data: any;
	redirectUrl: string;
	private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';

  constructor(private http: Http){
//    this.utility_data = [
//        {
//            id: UUID.UUID(),
//            name: 'High Utility Types',
//            description: 'Some Other Text',
//           	is_active: true,
//            inactive_date: null,
//            date_created: '2017-01-01',
//            date_updated: '2017-01-01',
//            created_by: 1,
//            updated_by: null,
//        },
//		{
//            id: UUID.UUID(),
//            name: 'High Utility Types 2',
//            description: 'Some Other Text',
//           	is_active: true,
//            inactive_date: null,
//            date_created: '2017-01-01',
//            date_updated: '2017-01-01',
//            created_by: 1,
//            updated_by: null,
//        }
//    ];
  }

//  getUtilities(): Observable<any> {
//    
//    return Observable.of(this.utility_data);
//  }
  
	 getUtilities(): Observable<any> {  	
		 var headers = new Headers();
		 headers.append('Content-Type', 'application/json');
		 var bearer = "Bearer " + localStorage.getItem('bearer_token');

		 headers.append('Authorization', bearer);
		 headers.append('Access-Control-Allow-Origin', '*');
		 headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		 var options = new RequestOptions({headers: headers});
		 var load_url = this.appUrl + 'utility-type/all';
		 console.log('Options ', options);

		 return this.http.get(load_url, options).map(this.extractData);
	  }


	addUtilityType(new_utility): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
		headers: headers
		});

		var add_url = this.appUrl + 'utility-type/add';

		// To Change the JSON object to urlencoded
		let url_search_params = new URLSearchParams();

		url_search_params.append('name', new_utility.name);
		url_search_params.append('description', new_utility.description);

		let utility_body = url_search_params.toString();
		console.log('expense Body URL encode', utility_body);
		return this.http.post(add_url, utility_body, options).map(this.extractData);
	  }


	updateUtilityType(update_utility){
		 var headers = new Headers();

		  headers.append('Content-Type', 'application/x-www-form-urlencoded');
		  headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		  headers.append('Access-Control-Allow-Origin', '*');
		  headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		  var options = new RequestOptions({
			  headers: headers
		  });


		  var update_url = this.appUrl + 'utility-type/update';

		  // To Change the JSON object to urlencoded
		  let url_search_params = new URLSearchParams();
		  url_search_params.append('utilityTypeId', update_utility.id);
		  url_search_params.append('name', update_utility.name);
		  url_search_params.append('description', update_utility.description);

		  let utility_body = url_search_params.toString();

		  console.log('expense_body URL encode', utility_body);

		  return this.http.post(update_url, utility_body, options).map(this.extractData);
	}

	deleteUtilityType(id): Observable<any> {
		console.log('Mo ID:', id);
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + 	localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var delete_url = this.appUrl + 'utility-type/delete';

		var delete_body = "utilityTypeId=" + id;
		console.log('test service delete', delete_body);
		return this.http.post(delete_url, delete_body, options).map(this.extractData);
	}
    
	private extractData(res: Response){
		let body = res.json();
		console.debug(body);
		return body || { };
	}
}
