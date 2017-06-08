﻿import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../global.state';

@Injectable()
export class TaskService{
    private appUrl = GlobalConfigs.APP_BASE_URL;

    // Observable sources
    private eventEmitted = new Subject<string>();

    // Observable streams
    public eventEmitted$ = this.eventEmitted.asObservable();
    
    constructor(private http: Http){
    }
    
    public getAllMyTasks(filters : any){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + '/work-order/all-my-task';
        
        if(filters == null){
            filters= {
                "filters": {
                }, 
                "first": 0, 
                "multiSortMeta": "undefined", 
                "rows": 10, 
                "sortField": "description", 
                "sortOrder": -1
            };
        }

        return this.http.post(load_url, filters, options).map(this.extractData);
    }

    public getMyTaskById(workOrderId: number) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/work-order/get/' + workOrderId;

        return this.http.get(load_url, options).map(this.extractData);
    }

    private extractData(res: Response){
        let body = res.json();
        console.debug(body);
        return body || { };
    }

    public announceEvent(eventName: string){
        this.eventEmitted.next(eventName);
    }
    // Move to other file?
    public addNewWorkOrder(formData: FormData) {
        //console.log("prepareSend", formData);

        var headers = new Headers();
        //headers.append('Content-Type', 'multipart/form-data');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        //formData.append('taskName', 'testing');

        var options = new RequestOptions({ headers: headers });
        return this.http.post(this.appUrl + '/work-order/add', formData, options).map(this.extractData);
    }

    // Move to other file?
    public updateWorkOrder(formData: FormData) {
        //console.log("prepareSend", formData);

        var headers = new Headers();
        //headers.append('Content-Type', 'multipart/form-data');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        //formData.append('taskName', 'testing');

        var options = new RequestOptions({ headers: headers });
        return this.http.post(this.appUrl + '/work-order/action', formData, options).map(this.extractData);
    }

    // Deprecated: maybe deleted later
    public getImage() {
        var headers = new Headers();
        //headers.append('Content-Type', 'multipart/form-data');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append("Accept", "application/octet-stream");
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        //formData.append('taskName', 'testing');

        var options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        //return this.http.get(this.appUrl + '/images/work-order/16', options);
        return this.http.get(this.appUrl + '/files/work-order/20', options);
    }

    public getImageById(imageId: number) {
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        var headers = new Headers();
        headers.append('Authorization', bearer);
        headers.append("Accept", "application/octet-stream");
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        return this.http.get(this.appUrl + '/images/work-order/' + imageId, options);
    }

    public getFileById(imageId: number) {
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        var headers = new Headers();
        headers.append('Authorization', bearer);
        headers.append("Accept", "application/octet-stream");
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        return this.http.get(this.appUrl + '/files/work-order/' + imageId, options);
    }
}