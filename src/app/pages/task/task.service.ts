import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';
import 'rxjs/add/operator/map';

@Injectable()
export class TaskService{
    private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/';
    //private appUrl = 'http://ems.kurisutaru.net/api/v1/';
    //private appUrl = 'http://192.168.1.252/api/v1/';
	//private appUrl = 'http://10.17.50.178/api/v1/';

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
        var load_url = this.appUrl + 'work-order/all-my-task';
        
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

    private extractData(res: Response){
        let body = res.json();
        console.debug(body);
        return body || { };
    }

    public announceEvent(eventName: string){
        this.eventEmitted.next(eventName);
    }
}