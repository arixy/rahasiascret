import { Component, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalState, GlobalConfigs } from '../../../global.state';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';

import 'style-loader!./baPageTop.scss';

@Component({
  selector: 'ba-page-top',
  templateUrl: './baPageTop.html',
  styleUrls: ['./../../../pages/styles/basic-theme.scss', './../../../pages/styles/primeng.min.css', './../../../pages/styles/modals.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(document:click)': 'onClick($event)',
  }
})
export class BaPageTop {

    private appUrl = GlobalConfigs.APP_AUTH_URL + '/';
  public oldpassword;
  public newpassword;
  public loggedUser;
  public isDropdownProfile = false;
  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;
  public isDropdownNewmenu:boolean = false;
  public isDropdownConfiguration: boolean = false;

  /*
    * Added by Mike
    *   to hide Configure Menu
  */
  private isCanConfigure: boolean = true;
  private configurationPerm = {
      isCanShow: () => {
          return this.configurationPerm.configurations.isCanShow()
              || this.configurationPerm.allList.isCanShow()
              || this.configurationPerm.administration.isCanShow();
      },
      "configurations": {
          isCanShow: () => {
              return this.configurationPerm.configurations.Location || this.configurationPerm.configurations.WOCategory;
          },
          "Location": false,
          "WOCategory": false,
      },
      "allList": {
          isCanShow: () => {
              return this.configurationPerm.allList.Vendor
                  || this.configurationPerm.allList.Tenant
                  || this.configurationPerm.allList.Owner
                  || this.configurationPerm.allList.Guest
                  || this.configurationPerm.allList.WOPriority
                  || this.configurationPerm.allList.ExpenseType
                  || this.configurationPerm.allList.UtilityType
                  || this.configurationPerm.allList.UtilityUOM;
          },
          "Vendor": false,
          "Tenant": false,
          "Owner": false,
          "Guest": false,
          "WOPriority": false,
          "ExpenseType": false,
          "UtilityType": false,
          "UtilityUOM": false
      },
      "administration": {
          isCanShow: () => {
              return this.configurationPerm.administration.User
                  || this.configurationPerm.administration.Role
                  || this.configurationPerm.administration.AccessRights
                  || this.configurationPerm.administration.SystemSetting;
          },
          "User": false,
          "Role": false,
          "AccessRights": false,
          "SystemSetting": false
      }
  }

  private sitemap;

  @ViewChild('changeModal') changeModal: ModalDirective;

  constructor(private _state:GlobalState,
             public authService: AuthenticationService,
             public router: Router,
             private _eref: ElementRef,
             private http: Http) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
      this.loggedUser = localStorage.getItem('logged_user');
      this.sitemap = {};
  }

  ngOnInit() {
      let authorizedSitemaps = JSON.parse(localStorage.getItem("authorizedSitemaps"));
      console.log("Sitemaps", authorizedSitemaps);

      this.sitemap = JSON.parse(localStorage.getItem("sitemaps"));

      for(let auth in this.configurationPerm){
          if(this.configurationPerm.hasOwnProperty(auth)){
              if(typeof this.configurationPerm[auth] != "function"){
                  for(let menu in this.configurationPerm[auth]){
                      if(this.configurationPerm[auth].hasOwnProperty(menu)){
                          if(typeof this.configurationPerm[auth][menu] != "function"){
                              if (authorizedSitemaps[menu] != null) {
                                  this.configurationPerm[auth][menu] = authorizedSitemaps[menu].allowAccessOrView || authorizedSitemaps[menu].allowAdd || authorizedSitemaps[menu].allowDelete || authorizedSitemaps[menu].allowUpdate;
                              }
                          }
                      }
                  }
              }
          }
      }

      console.log("config perms:", this.configurationPerm); 
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    return false;
  }

  public toggleDropdownNew(){
      this.isDropdownNewmenu = !this.isDropdownNewmenu;
  }
  public toggleDropdownConfig(){
      this.isDropdownConfiguration = !this.isDropdownConfiguration;
      console.log('Toggling!', this.isDropdownConfiguration);
  }
  public toggleDropdownProfile(){
      this.isDropdownProfile = !this.isDropdownProfile;
  }
  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }
  public hideChangeModal(){
      this.changeModal.hide();
  }
  public changePassword(){
      this.changeModal.show();
      
  }

    public submitPassword(){
        var headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
      headers.append('Access-Control-Allow-Origin', '*');
      headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
      
      var options = new RequestOptions({
          headers: headers
      });
      
      var add_url = this.appUrl + 'change-password';
      
      // To Change the JSON object to urlencoded
      let url_search_params = new URLSearchParams();
      
      url_search_params.append('oldPassword', this.oldpassword);
      url_search_params.append('newPassword', this.newpassword);
      
      let cp_body = url_search_params.toString();
      console.log('Location Body URL encode', cp_body);
      
      this.http.post(add_url, cp_body, options).map(
          res => {
              return res.json()
          }).subscribe(
            response => {
                console.log('Response from server', response);
                this.hideChangeModal();
            }
      );
    }
  public logout(){
      this.authService.postLogout();
      let redirect = '/login';
        console.log('Redirect URL:', redirect);
        //alert('Wait!');
        this.router.navigate([redirect]);
  }

  onClick(event) {
   if (!this._eref.nativeElement.contains(event.target)){ // or some similar check
     console.log('Closing!');
      this.isDropdownProfile = false;
      this.isDropdownNewmenu = false;
      this.isDropdownConfiguration = false;
       }
  }
}
