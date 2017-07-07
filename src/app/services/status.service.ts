import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../global.state';

@Injectable()
export class StatusService {
    redirectUrl: string;

    private appUrl = GlobalConfigs.APP_BASE_URL + "/lookup";

    constructor(private http: Http) {
        
    }

    getWorkOrderStatuses(): Observable<any> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/wo-status/all';

        return this.http.get(load_url, options).map(this.extractData);
    }

    private extractData(res: Response) {
        let body = res.json();
        console.debug(body);
        return body || {};
    }
}
