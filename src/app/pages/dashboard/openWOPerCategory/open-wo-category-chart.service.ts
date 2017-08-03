import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../../global.state';

@Injectable()
export class OpenWorkOrderCategoryChartService {
    private appUrl = GlobalConfigs.APP_BASE_URL;

    // Observable sources
    private eventEmitted = new Subject<string>();

    // Observable streams
    public eventEmitted$ = this.eventEmitted.asObservable();

    constructor(
        private http: Http) {
    }

    private extractData(res: Response) {
        let body = res.json();
        console.debug(body);
        return body || {};
    }

    getOpenWOPerCategory(filters) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/dashboard/open-wo-per-category-and-priority';
        console.log('Options ', options);

        if (filters == null) {
            filters = {
                "filters": {
                }
            };
        }

        return this.http.get(load_url, options).map(this.extractData);

        //let responseData = {
        //    data: [
        //        {
        //            woCategoryId: 1,
        //            woCategoryName: 'Electricity',
        //            priorityId: 1,
        //            priorityName: 'High',
        //            total: 4
        //        }, {
        //            woCategoryId: 1,
        //            woCategoryName: 'Electricity',
        //            priorityId: 2,
        //            priorityName: 'Medium',
        //            total: 1
        //        }, {
        //            woCategoryId: 2,
        //            woCategoryName: 'Water',
        //            priorityId: 2,
        //            priorityName: 'Medium',
        //            total: 1
        //        }
        //    ],
        //    resultCode: {
        //        code: "0",
        //        message: ""
        //    }
        //}

        //return Observable.of(responseData);
    }

    public announceEvent(eventName: string) {
        this.eventEmitted.next(eventName);
    }
}