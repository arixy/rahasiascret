import { Component, OnInit } from '@angular/core';
import { ExpensesService } from './expenses.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  providers: [ExpensesService]
})
export class ExpensesComponent implements OnInit {
  private expenses;
  private activeTasks;
  private newExpenseDescription;
  private newExpenseCost;
  constructor(private expensesService: ExpensesService) { }
  getExpenses(){
      this.expensesService.getExpenses().subscribe(
        data => {
            this.expenses = data;
        }
      );
  }
  ngOnInit() {
    this.getExpenses();
  }

    addNewExpense(){
        this.expensesService.add({
            description: this.newExpenseDescription,
            cost: this.newExpenseCost
        });
        
        // Refresh the List
        this.getExpenses();
    }
}