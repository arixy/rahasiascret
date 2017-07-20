import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { BaThemeConfigProvider, colorHelper, layoutPaths } from '../../../theme';

import { GlobalConfigs } from '../../../global.state';

@Injectable()
export class WorkOrderReportService {
    private appUrl = GlobalConfigs.APP_BASE_URL;

    // Observable sources
    private eventEmitted = new Subject<string>();

    // Observable streams
    public eventEmitted$ = this.eventEmitted.asObservable();

    constructor(
        private http: Http,
        private _baConfig: BaThemeConfigProvider) {
    }

    private extractData(res: Response) {
        let body = res.json();
        console.debug(body);
        return body || {};
    }

    getWorkOrdersAsReport(filters) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/report/work-order';
        console.log('Options ', options);

        if (filters == null) {
            filters = {
                "filters": {
                },
                "first": 0,
                "multiSortMeta": "undefined",
                "rows": 10,
                "sortField": "date",
                "sortOrder": -1
            };
        }

        return this.http.post(load_url, filters, options).map(this.extractData);
    }

    public exportWorkOrderReport(filters: any) {
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        var headers = new Headers();
        headers.append("Accept", "application/octet-stream");
        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        var load_url = this.appUrl + '/report/work-order/export';
        console.log('Options ', options);

        if (filters == null) {
            filters = {
                "filters": {
                },
                "first": 0,
                "multiSortMeta": "undefined",
                "rows": 10,
                "sortField": "date",
                "sortOrder": -1
            };
        }

        return this.http.post(load_url, filters, options);
    }
}