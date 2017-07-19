import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../global.state';


@Injectable()
export class WorkOrderTypeService {
    private wo_data: any;
    redirectUrl: string;
    //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';
    private appUrl = GlobalConfigs.APP_BASE_URL + '/lookup/';

    constructor(private http: Http) {
    }

    private extractData(res: Response) {
        let body = res.json();
        console.debug(body);
        return body || {};
    }

    getAllWorkOrderTypes(): Observable<any> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + 'wo-type/all';
        console.log('Options ', options);

        return this.http.get(load_url, options).map(this.extractData);
    }
}
