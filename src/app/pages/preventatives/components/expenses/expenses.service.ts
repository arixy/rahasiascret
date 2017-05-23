import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

let expenses = [
  { description: 'Biaya Makan', cost: 5000 }
];
@Injectable()
export class ExpensesService {
  constructor() { }

    getExpenses(): Observable<any> {
        return Observable.of(expenses);
    }
    add(data){
        expenses.push(data);
        return true;
    }
}