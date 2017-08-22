import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'all-list',
  templateUrl: './all-list.component.html',
  styleUrls: ['./all-list.component.scss']
})
export class AllList {
    private menuModel = [];

    constructor() {
    }

    ngOnInit() {
        let sitemaps = JSON.parse(localStorage.getItem('sitemaps'));
        let authorizedSitemaps = JSON.parse(localStorage.getItem('authorizedSitemaps'));

        if (authorizedSitemaps['Vendor'] != null
            && authorizedSitemaps['Vendor'].allowAccessOrView) {
            let sitemap = sitemaps['Vendor'];
            sitemap.route = "/pages/entities/1";
            this.menuModel.push(sitemap);
        }

        if (authorizedSitemaps['Owner'] != null
            && authorizedSitemaps['Owner'].allowAccessOrView) {
            let sitemap = sitemaps['Owner'];
            sitemap.route = "/pages/entities/4";
            this.menuModel.push(sitemap);
        }

        if (authorizedSitemaps['Tenant'] != null
            && authorizedSitemaps['Tenant'].allowAccessOrView) {
            let sitemap = sitemaps['Tenant'];
            sitemap.route = "/pages/entities/2";
            this.menuModel.push(sitemap);
        }

        if (authorizedSitemaps['Guest'] != null
            && authorizedSitemaps['Guest'].allowAccessOrView) {
            let sitemap = sitemaps['Guest'];
            sitemap.route = "/pages/entities/3";
            this.menuModel.push(sitemap);
        }

        if (authorizedSitemaps['WOPriority'] != null
            && authorizedSitemaps['WOPriority'].allowAccessOrView) {
            let sitemap = sitemaps['WOPriority'];
            sitemap.route = "/pages/priorities";
            this.menuModel.push(sitemap);
        }

        if (authorizedSitemaps['ExpenseType'] != null
            && authorizedSitemaps['ExpenseType'].allowAccessOrView) {
            let sitemap = sitemaps['ExpenseType'];
            sitemap.route = "/pages/expense-type";
            this.menuModel.push(sitemap);
        }

        if (authorizedSitemaps['UtilityType'] != null
            && authorizedSitemaps['UtilityType'].allowAccessOrView) {
            let sitemap = sitemaps['UtilityType'];
            sitemap.route = "/pages/utility-types";
            this.menuModel.push(sitemap);
        }

        if (authorizedSitemaps['UtilityUOM'] != null
            && authorizedSitemaps['UtilityUOM'].allowAccessOrView) {
            let sitemap = sitemaps['UtilityUOM'];
            sitemap.route = "/pages/utility-uom";
            this.menuModel.push(sitemap);
        }
    }
}
