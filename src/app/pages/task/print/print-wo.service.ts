import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../../global.state';

@Injectable()
export class PrintWOService {
    private appUrl = GlobalConfigs.APP_BASE_URL;

    // Observable sources
    private eventEmitted = new Subject<string>();

    // Observable streams
    public eventEmitted$ = this.eventEmitted.asObservable();

    constructor(private http: Http) {
    }

    private extractData(res: Response) {
        let body = res.json();
        console.debug(body);
        return body || {};
    }

    public getWorkOrderAsPrint(id: number) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/work-order/print/' + id;

        return this.http.get(load_url, options).map(this.extractData);
    }
}