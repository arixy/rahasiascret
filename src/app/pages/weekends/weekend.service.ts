import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class WeekendService{
  private weekend_data: any;

  redirectUrl: string;
    private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';

  constructor(private http: Http){
    this.weekend_data = 
        {
            id: UUID.UUID(),
            is_monday_weekend: false,
            is_tuesday_weekend: false,
           	is_wednesday_weekend: false,
            is_thursday_weekend: false,
            is_friday_weekend: false,
            is_saturday_weekend: true,
            is_sunday_weekend: true,
            is_active: true,
            inactive_date: null,
            date_created: '2017-01-01',
            date_updated: '2017-01-01',
            created_by: 1,
            updated_by: null,
        };
  }

  getWeekendsAndHolidays(): Observable<any> {
        var headers = new Headers();
		 headers.append('Content-Type', 'application/json');
		 var bearer = "Bearer " + localStorage.getItem('bearer_token');

		 headers.append('Authorization', bearer);
		 headers.append('Access-Control-Allow-Origin', '*');
		 headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		 var options = new RequestOptions({headers: headers});
		 var load_url = this.appUrl + 'holiday-and-weekend/all';
		 console.log('Options ', options);

		 return this.http.get(load_url, options).map(this.extractData);
  }

  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
    addWeekendsHolidays(weekends_holidays){
        var headers = new Headers();
		 headers.append('Content-Type', 'application/json');
		 var bearer = "Bearer " + localStorage.getItem('bearer_token');

		 headers.append('Authorization', bearer);
		 headers.append('Access-Control-Allow-Origin', '*');
		 headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		 var options = new RequestOptions({headers: headers});
		 var add_url = this.appUrl + 'holiday-and-weekend/add';
		 console.log('Options ', options);

		 return this.http.post(add_url, weekends_holidays, options).map(this.extractData);
    }
    updateWeekend(new_weekend){
        
        console.log('Editing', new_weekend);
        this.weekend_data = Object.assign({}, new_weekend);
		console.log('Latest', this.weekend_data);
        return true;
    }
    
    
    
    getWeekendNormal(){
        return this.weekend_data;
    }
}
