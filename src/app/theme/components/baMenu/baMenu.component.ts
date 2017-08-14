import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { BaMenuService } from '../../services';
import { GlobalState } from '../../../global.state';

import 'style-loader!./baMenu.scss';

@Component({
  selector: 'ba-menu',
  templateUrl: './baMenu.html'
})
export class BaMenu {

  @Input() sidebarCollapsed: boolean = false;
  @Input() menuHeight: number;

  @Output() expandMenu = new EventEmitter<any>();

  public menuItems: any[];
  protected _menuItemsSub: Subscription;
  public showHoverElem: boolean;
  public hoverElemHeight: number;
  public hoverElemTop: number;
  protected _onRouteChange: Subscription;
  public outOfArea: number = -200;

  private showMenuItems = [];

  constructor(private _router: Router, private _service: BaMenuService, private _state: GlobalState) {
  }

  public updateMenu(newMenuItems) {
    this.menuItems = newMenuItems;
    this.selectMenuAndNotify();
  }

  public selectMenuAndNotify(): void {
      console.log("selectMenuAndNotify", this.menuItems, this._router);
    if (this.menuItems) {
        this.menuItems = this._service.selectMenuItem(this.menuItems);
        this.showMenuItems = this.filterMenu(this.menuItems);
        console.log("after service.selectMenuItem", this.menuItems);
        this._state.notifyDataChanged('menu.activeLink', this._service.getCurrentItem());
    }
  }

  filterMenu(menuItems) {
      let items = [];
      menuItems.forEach((item) => {
          if (item.children && item.children.length > 0) {
              //console.log("menu has child", item);
              item.children = this.filterMenu(item.children);

              // by mike
              if (item.children.length == 0) {
                  return;
              }
              // end of by mike
          }

          if (item.children == null || item.children.length == 0) {

              if (item.route && item.route.data && item.route.data.menuId) {
                  let menuAuthorization = JSON.parse(localStorage.getItem('sitemaps'))[item.route.data.menuId];

                  if (menuAuthorization) {
                      item.title = menuAuthorization.name;
                  }

                  // if is Report (custom id)
                  if (item.route.data.menuId === '_MAINREPORT') {
                      let authorizedSitemaps = JSON.parse(localStorage.getItem('authorizedSitemaps'));
                      if ((authorizedSitemaps['ReportWorkOrder'] && authorizedSitemaps['ReportWorkOrder'].allowAccessOrView)
                          || (authorizedSitemaps['ReportPerformance'] && authorizedSitemaps['ReportPerformance'].allowAccessOrView)
                          || (authorizedSitemaps['ReportConsumption'] && authorizedSitemaps['ReportConsumption'].allowAccessOrView)) {
                          items.push(item);
                      }
                  } else {
                      //console.log("menu <hidden: false>, <children: no children>", item);
                      if (item.route.data.menuId) {
                          let menuAuthorization = JSON.parse(localStorage.getItem('authorizedSitemaps'))[item.route.data.menuId];
                          if (menuAuthorization != null && menuAuthorization.allowAccessOrView) {
                              //console.log("added menu by checking authorization", item);
                              items.push(item);
                          } else {
                              console.error("authorization menu", item, menuAuthorization);
                          }
                      }
                  }
              }
          } else {
              //console.log("added menu", item);
              items.push(item);
          }
      });

      return items;
  }

  public ngOnInit(): void {
    this._onRouteChange = this._router.events.subscribe((event) => {

      if (event instanceof NavigationEnd) {
        console.log("baMenu ngOnInit", this.menuItems, this._router);
        if (this.menuItems) {

          this.selectMenuAndNotify();
        } else {
          // on page load we have to wait as event is fired before menu elements are prepared
          setTimeout(() => this.selectMenuAndNotify());
        }
      }
    });

    this._menuItemsSub = this._service.menuItems.subscribe(this.updateMenu.bind(this));
  }

  public ngOnDestroy(): void {
    this._onRouteChange.unsubscribe();
    this._menuItemsSub.unsubscribe();
  }

  public hoverItem($event): void {
    this.showHoverElem = true;
    this.hoverElemHeight = $event.currentTarget.clientHeight;
    // TODO: get rid of magic 66 constant
    this.hoverElemTop = $event.currentTarget.getBoundingClientRect().top - 66;
  }

  public toggleSubMenu($event): boolean {
    let submenu = jQuery($event.currentTarget).next();

    if (this.sidebarCollapsed) {
      this.expandMenu.emit(null);
      if (!$event.item.expanded) {
        $event.item.expanded = true;
      }
    } else {
      $event.item.expanded = !$event.item.expanded;
      submenu.slideToggle();
    }

    return false;
  }
}
