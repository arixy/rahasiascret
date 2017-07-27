import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../global.state';
@Injectable()
export class EntityService{
	private entity_data: any;
	redirectUrl: string;
    private appUrl = GlobalConfigs.APP_BASE_URL + '/master/';  //'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';

  constructor(private http: Http){

    
  }

	getEntities(): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		var bearer = "Bearer " + localStorage.getItem('bearer_token');

		headers.append('Authorization', bearer);
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({headers: headers});
		var load_url = this.appUrl + 'entity/all';
		console.log('Options ', options);
		return this.http.get(load_url, options).map(this.extractData);
    }
    getEntitiesByType(entityTypeId: number): Observable<any> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + 'entity/get-by-type/' + entityTypeId;
        console.log('Options ', options);

        return this.http.get(load_url, options).map(this.extractData);
    }
    
    getEntitiesFilter(entityTypeId: number, filter_data): Observable<any> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + 'entity/all';

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
	addEntity(new_entity): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
		headers: headers
		});

		var add_url = this.appUrl + 'entity/add';

		// To Change the JSON object to urlencoded
		let url_search_params = new URLSearchParams();
		url_search_params.append('name', new_entity.name);
		url_search_params.append('description', new_entity.description);
		url_search_params.append('entityTypeId', new_entity.entity_type_id);
		url_search_params.append('address1', new_entity.address1);
        url_search_params.append('address2', '');
		url_search_params.append('contactPerson', new_entity.contact_person);
		url_search_params.append('phone1', new_entity.phone1);
        url_search_params.append('phone2', '');
        url_search_params.append('phone3', '');
	

		let entity_body = url_search_params.toString();
		console.log('Entity Body URL encode', entity_body);
		return this.http.post(add_url, entity_body, options).map(this.extractData);
  }

  updateEntity(edit_entity){
	  var headers = new Headers();
      
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      
      var update_url = this.appUrl + 'entity/update';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
     	url_search_params.append('entityId', edit_entity.id);
     	url_search_params.append('name', edit_entity.name);
		url_search_params.append('description', edit_entity.description);
		url_search_params.append('entityTypeId', edit_entity.entity_type_id);
		url_search_params.append('address1', edit_entity.address1);
		url_search_params.append('address2', '');
		url_search_params.append('contactPerson', edit_entity.contact_person);
		url_search_params.append('phone1', edit_entity.phone1);
        url_search_params.append('phone2', '');
        url_search_params.append('phone3', '');
      
      let edit_entity_body = url_search_params.toString();
      
      console.log('edit_entity_body URL encode', edit_entity_body);
      
      return this.http.post(update_url, edit_entity_body, options).map(this.extractData);
    }

    deleteEntity(id): Observable<any> {
        var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var delete_url = this.appUrl + 'entity/delete';

		var delete_body = "entityId=" + id;
		console.log('test service delete', delete_body);
		return this.http.post(delete_url, delete_body, options).map(this.extractData);
    }
 	private extractData(res: Response){
    	let body = res.json();
		console.debug(body);
    	return body || { };
  	}
}
