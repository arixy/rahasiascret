import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../global.state';


@Injectable()
export class WorkOrderService{
  private wo_data: any;
  redirectUrl: string;
  //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';
  private appUrl = GlobalConfigs.APP_BASE_URL + '/master/';

  constructor(private http: Http){
    this.wo_data = [
        /* {
            id: UUID.UUID(),
            name: 'Maintenance',
            description: 'Maintenance Category',
            prefix: 'MON1',
            kpi_baseline: 20
        } */
    ];
      
  }

  getWOs(): Observable<any> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var bearer = "Bearer " + localStorage.getItem('bearer_token');

    headers.append('Authorization', bearer);
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
    
    var options = new RequestOptions({headers: headers});
    var load_url = this.appUrl + 'wo-category/all';
    console.log('Options ', options);

    return this.http.get(load_url, options).map(this.extractData);
  }
 getWorkOrdersNormal(){
      return this.wo_data;
  }
  get(wocategory_id){
      return this.wo_data.find(
        (wo_data) => {
            return wo_data.id == wocategory_id;
        }
    );
  }
  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
  addWO(work_order): Observable<any> {
      
      var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var add_url = this.appUrl + 'wo-category/add';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('name', work_order.name);
      url_search_params.append('description', work_order.description);
      url_search_params.append('prefix', work_order.prefix);
      url_search_params.append('kpiBaseline', work_order.kpi_baseline);
      // YS: temporary until select box for duration ID is done
      url_search_params.append('kpiBaselineDurationId', work_order.kpi_baseline_duration_id);
      
      let wo_category_body = url_search_params.toString();
      console.log('Wo Category Body URL encode', wo_category_body);
      return this.http.post(add_url, wo_category_body, options).map(this.extractData);
  }

  deleteWorkOrder(wocategory_id): Observable<any> {
      var headers = new Headers();
      
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var delete_url = this.appUrl + 'wo-category/delete';
      
      var delete_body = "woCategoryId=" + wocategory_id;
      
      return this.http.post(delete_url, delete_body, options).map(this.extractData);
  }


  updateWOCategory(work_order){
      
      var headers = new Headers();
      
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      
      var update_url = this.appUrl + 'wo-category/update';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('woCategoryId', work_order.id);
      url_search_params.append('name', work_order.name);
      url_search_params.append('description', work_order.description);
      url_search_params.append('prefix', work_order.prefix);
      url_search_params.append('kpiBaseline', work_order.kpi_baseline);
      // YS: temporary until select box for duration ID is done
      url_search_params.append('kpiBaselineDurationId', "1");
      
      let wo_category_body = url_search_params.toString();
      
      console.log('Wo Category Body URL encode', wo_category_body);
      
      return this.http.post(update_url, wo_category_body, options).map(this.extractData);
  }



}
