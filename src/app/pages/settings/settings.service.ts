import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { GlobalConfigs } from '../../global.state';

@Injectable()
export class SettingsService {
    private appUrl = GlobalConfigs.APP_BASE_URL + "/lookup";

    constructor(private http: Http) {
    }

    private extractData(res: Response) {
        let body = res.json();
        console.debug(body);
        return body || {};
    }

    public getAllSettings(){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + '/system-setting/all';

        return this.http.get(load_url, options).map(this.extractData);
    }

    public updateSettings(updatedSettings: any) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers });
        var load_url = this.appUrl + '/system-setting/update';

        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('systemSettings', JSON.stringify(updatedSettings));

        let requestBody = urlSearchParams.toString();
        //console.log('expense Body URL encode', requestBody);

        return this.http.post(load_url, requestBody, options).map(this.extractData);
    }
}

////SystemSettingViewModel 
//path("/system-setting", () -> {
//    get("/all", LookupController.getAllSystemSetting);
///*get("/get/:systemSettingId", LookupController.getSystemSettingBySystemSettingId; 
//post("/add", LookupController.insertSystemSetting);*/
//post("/update", LookupController.updateSystemSetting);
//     /*post("/delete", LookupController.deleteSystemSetting);*/ 
//    });