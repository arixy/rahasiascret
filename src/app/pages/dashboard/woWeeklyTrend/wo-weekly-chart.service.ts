import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../../global.state';

@Injectable()
export class WorkOrderWeeklyChartService {
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

    getWOWeeklyPerCategory(filters) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/dashboard/trend-weekly-wo-per-category';
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
        //            "date": "2017-07-24",
        //            "woCategoryId": 3,
        //            "woCategoryName": "Electricity Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-25",
        //            "woCategoryId": 3,
        //            "woCategoryName": "Electricity Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-26",
        //            "woCategoryId": 3,
        //            "woCategoryName": "Electricity Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-27",
        //            "woCategoryId": 3,
        //            "woCategoryName": "Electricity Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-28",
        //            "woCategoryId": 3,
        //            "woCategoryName": "Electricity Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-29",
        //            "woCategoryId": 3,
        //            "woCategoryName": "Electricity Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-30",
        //            "woCategoryId": 3,
        //            "woCategoryName": "Electricity Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-24",
        //            "woCategoryId": 4,
        //            "woCategoryName": "Lighting Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-25",
        //            "woCategoryId": 4,
        //            "woCategoryName": "Lighting Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-26",
        //            "woCategoryId": 4,
        //            "woCategoryName": "Lighting Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-27",
        //            "woCategoryId": 4,
        //            "woCategoryName": "Lighting Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-28",
        //            "woCategoryId": 4,
        //            "woCategoryName": "Lighting Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-29",
        //            "woCategoryId": 4,
        //            "woCategoryName": "Lighting Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-30",
        //            "woCategoryId": 4,
        //            "woCategoryName": "Lighting Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-24",
        //            "woCategoryId": 5,
        //            "woCategoryName": "Property Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-25",
        //            "woCategoryId": 5,
        //            "woCategoryName": "Property Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-26",
        //            "woCategoryId": 5,
        //            "woCategoryName": "Property Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-27",
        //            "woCategoryId": 5,
        //            "woCategoryName": "Property Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-28",
        //            "woCategoryId": 5,
        //            "woCategoryName": "Property Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-29",
        //            "woCategoryId": 5,
        //            "woCategoryName": "Property Issues",
        //            "total": 0
        //        }, {
        //            "date": "2017-07-30",
        //            "woCategoryId": 5,
        //            "woCategoryName": "Property Issues",
        //            "total": 0
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