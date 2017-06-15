import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { GlobalConfigs } from '../global.state';

@Injectable()
export class PeriodService{
    redirectUrl: string;

    private appUrl = GlobalConfigs.APP_BASE_URL + "/lookup";

    constructor(private http: Http){
    }

    getRepeatOptions(): Observable<any> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
    
        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + '/repeat-option/all';
      
        return this.http.get(load_url, options).map(this.extractData);
    }

    getPeriodDurations(): Observable<any> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/period-duration/all';

        return this.http.get(load_url, options).map(this.extractData);
    }

    private extractData(res: Response){
      let body = res.json();
      console.debug(body);
      return body || { };
    }
}
