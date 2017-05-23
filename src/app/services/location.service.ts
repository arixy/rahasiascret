import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class LocationService{
  private location_data: any;

  redirectUrl: string;
    
    private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';

  constructor(private http: Http){
    var first_floor_id = UUID.UUID();
    this.location_data = [
        {
            id: first_floor_id,
            name: 'Floor 1',
            description: 'The first floor',
            parent_location_id: null
        },
        {
            id: UUID.UUID(),
            name: 'Floor 2',
            description: 'The second floor',
            parent_location_id: null
        },
        {
            id: UUID.UUID(),
            name: 'Unit 18J',
            description: 'Cool Apartment Unit',
            parent_location_id: first_floor_id
        }
    ];
  }

  getLocations(): Observable<any> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var bearer = "Bearer " + localStorage.getItem('bearer_token');

    headers.append('Authorization', bearer);
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
    
    var options = new RequestOptions({headers: headers});
    var load_url = this.appUrl + 'location/all';
      
    return this.http.get(load_url, options).map(this.extractData);  
    //return Observable.of(this.location_data);
  }
  getLocationsNormal(){
      return this.location_data;
  }
  get(location_id){
      return this.location_data.find(
        (location) => {
            return location.id == location_id;
        }
      );
  }

  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
  addLocation(location): Observable<any> {
      
      var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var add_url = this.appUrl + 'location/add';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('name', location.name);
      url_search_params.append('description', location.description);
      url_search_params.append('parentLocationId', location.parent_location_id);
      url_search_params.append('isRoot', location.isRoot);
      // YS: temporary default to true
      url_search_params.append('haveChild', "true");
      
      let location_body = url_search_params.toString();
      console.log('Location Body URL encode', location_body);
      
      return this.http.post(add_url, location_body, options).map(this.extractData);
  }
  updateLocation(location){
      
      var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var update_url = this.appUrl + 'location/update';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('locationId', location.id);
      url_search_params.append('name', location.name);
      url_search_params.append('description', location.description);
      url_search_params.append('parentLocationId', location.parent_location_id);
      url_search_params.append('isRoot', "true");
      // YS: temporary default to true
      url_search_params.append('haveChild', "true");
      
      let location_body = url_search_params.toString();
      console.log('Location Body URL encode', location_body);
      
      return this.http.post(update_url, location_body, options).map(this.extractData);
      
  }

    deleteLocation(location_id): boolean {
        this.location_data = this.location_data.filter(
            (location) => {
                return !(location.id == location_id);
            }
        );
        return false;
    }

}
