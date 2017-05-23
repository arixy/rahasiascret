import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class HolidayService{
  private role_data: any;

  redirectUrl: string;

  constructor(private http: Http){
    this.role_data = [
        {
            id: UUID.UUID(),
            name: 'Lebaran',
            from_date: '2017-05-06',
            to_date: '2017-05-21',
            flag_holiday: true,
           	is_active: true,
            inactive_date: null,
            date_created: '2017-01-01',
            date_updated: '2017-01-01',
            created_by: 1,
            updated_by: null,
        }
    ];
  }

  getHoliday(): Observable<any> {
    
    return Observable.of(this.role_data);
  }

  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
    
  addHoliday(new_role): boolean {
      console.log('test role service',new_role);
      this.role_data.push({
            id: UUID.UUID(),
            name: new_role.name,
            description: new_role.description,
		  	role_type_id: UUID.UUID(),
            is_active: true,
            inactive_date: null,
            date_created: '2017-01-01',
            date_updated: '2017-01-01',
            created_by: 1,
            updated_by: null,
      });
      return true;
  }
    updateRole(update_role){
        console.log('Editing', update_role);
        this.role_data = this.role_data.map(
            (role) => {
                if(role.id == update_role.id){
                    return Object.assign({}, role, {
                        name: update_role.name,
                        description: update_role.description,
                        role_type_id: update_role.role_type_id,
                        is_active: true,
                        inactive_date: null,
                        date_created: '2017-01-01',
                        date_updated: '2017-01-01',
                        created_by: 1,
                        updated_by: null,
                    });
                }
                return role;
            }
        );
		console.log('Latest', this.role_data);
      return true;
    }
    deleteRole(id): boolean {
        console.log('Mo ID:', id);
        this.role_data = this.role_data.filter(
            (role) => {
                console.log('Maintenance inside filter:', role);
                if(role.id == id){
                    return false;
                } 
                return true;
            }
        );
        return this.role_data;
    }
    
    
    getRoleNormal(){
        return this.role_data;
    }
}
