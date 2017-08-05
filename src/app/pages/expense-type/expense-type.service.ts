import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../global.state';
@Injectable()
export class ExpenseTypeService{
	private expense_data: any;
	redirectUrl: string;
    //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';
    private appUrl = GlobalConfigs.APP_BASE_URL + '/master/';

	constructor(private http: Http){
   	
  	}

getExpenses(): Observable<any> {
	var headers = new Headers();
	headers.append('Content-Type', 'application/json');
	var bearer = "Bearer " + 	localStorage.getItem('bearer_token');
	
	headers.append('Authorization', bearer);
	headers.append('Access-Control-Allow-Origin', '*');
	headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
    
	var options = new RequestOptions({headers: headers});
	var load_url = this.appUrl + 'expense-type/all';
	console.log('Options ', options);
	
	return this.http.get(load_url, options).map(this.extractData);
}

    getExpenseTypesFilter(filter_data){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + 'expense-type/all';
        
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

 addExpenseType(new_expense): Observable<any> {
	var headers = new Headers();
	headers.append('Content-Type', 'application/x-www-form-urlencoded');
	headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
	headers.append('Access-Control-Allow-Origin', '*');
	headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
	var options = new RequestOptions({
	headers: headers
	});
      
	var add_url = this.appUrl + 'expense-type/add';
      
	// To Change the JSON object to urlencoded
	let url_search_params = new URLSearchParams();
      
	url_search_params.append('name', new_expense.name);
	url_search_params.append('description', new_expense.description);
	  
	let expense_body = url_search_params.toString();
	console.log('expense Body URL encode', expense_body);
	return this.http.post(add_url, expense_body, options).map(this.extractData);
  }
  
  updateExpenseType(update_expense){
	  var headers = new Headers();
      
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      
      var update_url = this.appUrl + 'expense-type/update';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('expenseTypeId', update_expense.id);
      url_search_params.append('name', update_expense.name);
      url_search_params.append('description', update_expense.description);
      
      let expense_body = url_search_params.toString();
      
      console.log('expense_body URL encode', expense_body);
      
      return this.http.post(update_url, expense_body, options).map(this.extractData);
    }

	deleteExpenseType(expensetypeid): Observable<any> {
		var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var delete_url = this.appUrl + 'expense-type/delete';

		var delete_body = "expenseTypeId=" + expensetypeid;
		console.log('test service delete', delete_body);
		return this.http.post(delete_url, delete_body, options).map(this.extractData);
    }
    
  
	private extractData(res: Response){
		let body = res.json();
		console.debug(body);
		return body || { };
	}
}
