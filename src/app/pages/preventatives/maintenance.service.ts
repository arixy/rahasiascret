import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { GlobalConfigs } from '../../global.state';

@Injectable()
export class MaintenanceService{
  private maintenance_data: any;

  redirectUrl: string;
    
    private appUrl = GlobalConfigs.APP_BASE_URL;

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
}
