import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class UtilityConsumptionsService{
  private utility_uom_data: any;

  redirectUrl: string;

  constructor(private http: Http){
    this.utility_uom_data = [
        {
            id: UUID.UUID(),
            utility_type_id: 1,
            date: '2017-04-01',
            name: 'High Utility Consumptions',
            description: 'Some Other Text',
            total: 400.0975,
            uom_id: 1,
            exclusions: [
                {
                    total: 100,
                    description: 'Unit 18J'
                }
            ],
           	is_active: true,
            inactive_date: null,
            date_created: '2017-01-01',
            date_updated: '2017-01-01',
            created_by: 1,
            updated_by: null,
        }
    ];
  }

  getUtilityConsumptions(): Observable<any> {
    
    return Observable.of(this.utility_uom_data);
  }

  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
    
  addUtilityUom(new_utility): boolean {
      console.log('test utility service',new_utility);
      this.utility_uom_data.push({
            id: UUID.UUID(),
            name: new_utility.name,
            description: new_utility.description,
            is_active: true,
            inactive_date: null,
            date_created: '2017-01-01',
            date_updated: '2017-01-01',
            created_by: 1,
            updated_by: null,
      });
      return true;
  }
    updateUtilityUom(update_utility){
        console.log('Editing', update_utility);
        this.utility_uom_data = this.utility_uom_data.map(
            (utility) => {
                if(utility.id == update_utility.id){
                    return Object.assign({}, utility, {
                        name: update_utility.name,
                        description: update_utility.description,
                        is_active: true,
                        inactive_date: null,
                        date_created: '2017-01-01',
                        date_updated: '2017-01-01',
                        created_by: 1,
                        updated_by: null,
                    });
                }
                return utility;
            }
        );
		console.log('Latest', this.utility_uom_data);
      return true;
    }
    deleteUtilityUom(id): boolean {
        console.log('Mo ID:', id);
        this.utility_uom_data = this.utility_uom_data.filter(
            (utility) => {
                console.log('Maintenance inside filter:', utility);
                if(utility.id == id){
                    return false;
                } 
                return true;
            }
        );
        return this.utility_uom_data;
    }
    
    
    getUtilitiesNormal(){
        return this.utility_uom_data;
    }
}
