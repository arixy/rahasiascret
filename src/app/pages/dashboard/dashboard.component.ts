import { Component, ViewChild } from '@angular/core';
import { SelectComponent } from 'ng2-select';

@Component({
  selector: 'dashboard',
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html'
})
export class Dashboard {
    private isAllowAccessOrView: boolean = false;

    constructor() {

    }

    ngOnInit() {
        // logged-in user can only view dashboard content if has Access Right checked
        let authorizedSitemaps = JSON.parse(localStorage.getItem("authorizedSitemaps"));
        this.isAllowAccessOrView = authorizedSitemaps['Dashboard'] != null && authorizedSitemaps['Dashboard'].allowAccessOrView;
    }
}
