import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../global.state';

@Injectable()
export class UtilityConsumptionsService{
  private utility_uom_data: any;

  redirectUrl: string;

  private appUrl = GlobalConfigs.APP_BASE_URL + '/utility-consumption';

  // Observable sources
  private eventEmitted = new Subject<string>();

  // Observable streams
  public eventEmitted$ = this.eventEmitted.asObservable();

  constructor(private http: Http){
      this.utility_uom_data = {
          data: [
              {
                  id: UUID.UUID(),
                  utilityConsumptionId: 1,
                  utility_type_id: 1,
                  date: '2017-04-01',
                  name: 'High Utility Consumptions',
                  description: 'Some Other Text',
                  value: 400.0975,
                  uomId: 1,
                  utilityConsumptionExclusions: [
                      {
                          value: 100,
                          description: 'Unit 18J'
                      }
                  ],
                  is_active: true,
                  inactive_date: null,
                  date_created: '2017-01-01',
                  date_updated: '2017-01-01',
                  created_by: 1,
                  updated_by: null,
              }
          ],
          resultCode: {
              code: 0
          }
      };
  }

  public announceEvent(eventName: string) {
      this.eventEmitted.next(eventName);
  }

  getUtilityConsumptions(filters: any): Observable<any> {
    
    //return Observable.of(this.utility_uom_data);

      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      var bearer = "Bearer " + localStorage.getItem('bearer_token');

      headers.append('Authorization', bearer);
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

      var options = new RequestOptions({ headers: headers });
      var load_url = this.appUrl + '/all';
      console.log('Options ', options);

      if (filters == null) {
          filters = {
              "filters": {
              },
              "first": 0,
              "multiSortMeta": "undefined",
              "rows": 10,
              "sortField": "id",
              "sortOrder": -1
          };
      }

      return this.http.post(load_url, filters, options).map(this.extractData);

      //return Observable.of(this.utility_uom_data);
  }

  getUtilityConsumptionById(id: number) {
      var headers = new Headers();
      headers.append('Content-Type', 'application/json');
      var bearer = "Bearer " + localStorage.getItem('bearer_token');

      headers.append('Authorization', bearer);
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

      var options = new RequestOptions({ headers: headers });
      var load_url = this.appUrl + '/get/' + id;
      console.log('Options ', options);

      return this.http.get(load_url, options).map(this.extractData);
  }

  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
    
  addUtilityUom(new_utility): boolean {
      console.log('test utility service',new_utility);
      this.utility_uom_data.push({
            id: UUID.UUID(),
            name: new_utility.name,
            description: new_utility.description,
            is_active: true,
            inactive_date: null,
            date_created: '2017-01-01',
            date_updated: '2017-01-01',
            created_by: 1,
            updated_by: null,
      });
      return true;
  }
    updateUtilityUom(update_utility){
        console.log('Editing', update_utility);
        this.utility_uom_data = this.utility_uom_data.map(
            (utility) => {
                if(utility.id == update_utility.id){
                    return Object.assign({}, utility, {
                        name: update_utility.name,
                        description: update_utility.description,
                        is_active: true,
                        inactive_date: null,
                        date_created: '2017-01-01',
                        date_updated: '2017-01-01',
                        created_by: 1,
                        updated_by: null,
                    });
                }
                return utility;
            }
        );
		console.log('Latest', this.utility_uom_data);
      return true;
    }
    deleteUtilityUom(id): boolean {
        console.log('Mo ID:', id);
        this.utility_uom_data = this.utility_uom_data.filter(
            (utility) => {
                console.log('Maintenance inside filter:', utility);
                if(utility.id == id){
                    return false;
                } 
                return true;
            }
        );
        return this.utility_uom_data;
    }
    
    
    getUtilitiesNormal(){
        return this.utility_uom_data;
    }

    addUtilityConsumption(formDataJson) {
        var headers = new Headers();
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        return this.http.post(this.appUrl + '/add', formDataJson, options).map(this.extractData);
    }

    updateUtilityConsumption(formDataJson) {
        var headers = new Headers();
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        return this.http.post(this.appUrl + '/update', formDataJson, options).map(this.extractData);
    }

    deleteUtilityConsumption(utilityConsumptionId: number) {
        var headers = new Headers();
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        
        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('utilityConsumptionId', utilityConsumptionId + "");

        let requestBody = urlSearchParams.toString();
        console.log('expense Body URL encode', requestBody);

        return this.http.post(this.appUrl + '/delete', requestBody, options).map(this.extractData);
    }
}
