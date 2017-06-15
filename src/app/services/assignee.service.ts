import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../../global.state';

@Injectable()
export class UsersService {
    private user_data: any;
    redirectUrl: string;
    //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/';
    private appUrl = GlobalConfigs.APP_BASE_URL + "/";


    constructor(private http: Http) {

    }

    getAssigneeByTypeId(typeName: string, typeId: number): Observable<any> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + 'admin/user/all';
        console.log('Options ', options);

        return this.http.post(load_url, {"type": typeName, "id": typeId}, options).map(this.extractData);
    }
    

    private extractData(res: Response) {
        let body = res.json();
        console.debug(body);
        return body || {};
    }
}
