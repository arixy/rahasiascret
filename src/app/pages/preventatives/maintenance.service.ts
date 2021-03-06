import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { GlobalConfigs } from '../../global.state';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

@Injectable()
export class MaintenanceService{
  private maintenance_data: any;

  redirectUrl: string;
    
    private appUrl = GlobalConfigs.APP_BASE_URL;

    // Observable Sources
    private eventEmitted = new Subject<string>();

    // Observable Streams
    public eventEmitted$ = this.eventEmitted.asObservable();

  constructor(private http: Http){
    this.maintenance_data = [
        {
            id: UUID.UUID(),
            task: 'Weekly Maintenance',
            wo_number: 'WO1001',
            description: 'Some Maintenance',
            wo_category_id: null,
            location_id: null,
            asset_id: null,
            due_after: '5 days',
            due_period: 'Daily',
            start_date: '2017-03-02',
            priority: 'High',
            status: 'New',
            completed_at: ''
        }
    ];
  }

    public getAllMyTasks(filters : any){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + '/work-order/all';
        
        if(filters == null){
            filters= {
                "filters": {
                }, 
                "first": 0, 
                "multiSortMeta": "undefined", 
                "rows": 10, 
                "sortField": "taskName", 
                "sortOrder": -1
            };
        }

        return this.http.post(load_url, filters, options).map(this.extractData);
    }
  getMaintenances(): Observable<any> {
    
    return Observable.of(this.maintenance_data);
  }
  getScheduledWOs(filters: any): Observable<any> {
      var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + '/work-order/all-with-schedule';
        
        if(filters == null){
            filters= {
                "filters": {
                }, 
                "first": 0, 
                "multiSortMeta": "undefined", 
                "rows": 10, 
                "sortField": "taskName", 
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
  addMaintenance(maintenance_order): boolean {
      console.log(maintenance_order);
      this.maintenance_data.push({
        id: UUID.UUID(),
        task: maintenance_order.task,
        wo_number: maintenance_order.wo_number,
        description: maintenance_order.description,
        wo_category_id: maintenance_order.wo_category_id,
        due_after: maintenance_order.due_after,
        start_date: maintenance_order.start_date,
        priority: maintenance_order.priority,
        due_period: maintenance_order.due_period,
        every: maintenance_order.every,
        period: maintenance_order.period,
        status: 'New',
        completed_at: ''
      });
      return true;
  }
    
    deleteMaintenance(mo_id): boolean {
        console.log('Mo ID:', mo_id);
        this.maintenance_data = this.maintenance_data.filter(
            (maintenance) => {
                console.log('Maintenance inside filter:', maintenance);
                if(maintenance.id == mo_id){
                    return false;
                } 
                return true;
            }
        );
        return this.maintenance_data;
    }
    
    completeMaintenance(mo_id) {
        console.log('Completing Maintenance');
        return true;
    }
    
    changeStatus(mo_id, status: boolean){
        this.maintenance_data = this.maintenance_data.map(
            (maintenance) => {
                if(maintenance.id == mo_id){
                    if(status == true){
                        return Object.assign({}, maintenance, {
                           status: 'Completed',
                            completed_at: new Date()
                        });
                    }
                    return Object.assign({}, maintenance, {
                        status: 'New',
                        completed_at: ''
                    });
                }
                return maintenance;
            }
        );
    }
    
    getMaintenancesNormal(){
        return this.maintenance_data;
    }
    public announceEvent(eventName: string){
        this.eventEmitted.next(eventName);
    }
    
    public getAllWOs(filters : any){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + '/work-order/all-without-schedule';
        
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

    public getAllWorkOrdersCSV(filters): Observable<any> {
        var bearer = "Bearer " + localStorage.getItem('bearer_token');
        var headers = new Headers();

        headers.append("Accept", "application/octet-stream");
        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        var load_url = this.appUrl + '/work-order/all-without-schedule/export';

        let formated_object = {
            filters: {},
            first: 0,
            rows: 9999,
            globalFilter: '',
            multiSortMeta: null,
            sortField: 'dateUpdated',
            sortOrder: -1
        };
        console.log("filter_data ", filters);
        if (filters) {
            formated_object = filters;
        }

        return this.http.post(load_url, formated_object, options);
    }

    public getAllScheduleWorkOrdersCSV(filters): Observable<any> {
        var bearer = "Bearer " + localStorage.getItem('bearer_token');
        var headers = new Headers();

        headers.append("Accept", "application/octet-stream");
        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        var load_url = this.appUrl + '/work-order/all-with-schedule/export';

        let formated_object = {
            filters: {},
            first: 0,
            rows: 9999,
            globalFilter: '',
            multiSortMeta: null,
            sortField: 'dateUpdated',
            sortOrder: -1
        };

        if (filters) {
            formated_object = filters;
        }

        return this.http.post(load_url, formated_object, options);
    }
    
}
