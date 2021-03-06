import { Component, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalState, GlobalConfigs } from '../../../global.state';
import { GrowlMessage, MessageLabels, MessageSeverity } from '../../../popup-notification';
import { GROWL_MESSAGES, DEFAULT_LIFE_TIME } from '../../../popup-notification';
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
  private messages = GROWL_MESSAGES;
  private life = DEFAULT_LIFE_TIME;

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
  // end configuration

  // to hide new button and its child
  private newMenu = {
      isCanShow: () => {
          return this.newMenu.buildingManagement.length > 0
              || this.newMenu.assets.length > 0
              || this.newMenu.ownerTenants.length > 0
              || this.newMenu.utilities.length > 0;
      },
      buildingManagement: [],
      assets: [],
      ownerTenants: [],
      utilities: []
  };
  // change password related
  private errMsgChangePw = [];
  private formGroupChangePw: FormGroup;
  // end change password related
  @ViewChild('changeModal') changeModal: ModalDirective;

  constructor(private _state:GlobalState,
             public authService: AuthenticationService,
             public router: Router,
             private _eref: ElementRef,
             private http: Http,
             private fb: FormBuilder) {
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

      if (authorizedSitemaps != null && this.sitemap != null) {
          for (let auth in this.configurationPerm) {
              if (this.configurationPerm.hasOwnProperty(auth)) {
                  if (typeof this.configurationPerm[auth] != "function") {
                      for (let menu in this.configurationPerm[auth]) {
                          if (this.configurationPerm[auth].hasOwnProperty(menu)) {
                              if (typeof this.configurationPerm[auth][menu] != "function") {
                                  if (authorizedSitemaps[menu] != null) {
                                      this.configurationPerm[auth][menu] = authorizedSitemaps[menu].allowAccessOrView || authorizedSitemaps[menu].allowAdd || authorizedSitemaps[menu].allowDelete || authorizedSitemaps[menu].allowUpdate;
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }

      console.log("config perms:", this.configurationPerm); 
      // create form group
      this.formGroupChangePw = this.fb.group({
          'oldPassword': ['', Validators.compose([Validators.required])],
          'newPassword': ['', Validators.compose([Validators.required])]
      });
      //============================
      // New Menu authorization
      //
      //    Building Management
      if (authorizedSitemaps['SingleWorkOrder'] != null
          && authorizedSitemaps['SingleWorkOrder'].allowAccessOrView) {
          let sitemap = this.sitemap['SingleWorkOrder'];
          sitemap.route = '/pages/transactions/workorders/single';
          this.newMenu.buildingManagement.push(sitemap);
      }

      if (authorizedSitemaps['RecurringWorkOrder'] != null
          && authorizedSitemaps['RecurringWorkOrder'].allowAccessOrView) {
          let sitemap = this.sitemap['RecurringWorkOrder'];
          sitemap.route = '/pages/transactions/workorders/recurring';
          this.newMenu.buildingManagement.push(sitemap);
      }

      //    Assets
      if (authorizedSitemaps['PreventiveWorkOrder'] != null
          && authorizedSitemaps['PreventiveWorkOrder'].allowAccessOrView) {
          let sitemap = this.sitemap['PreventiveWorkOrder'];
          sitemap.route = '/pages/transactions/workorders/preventive';
          this.newMenu.assets.push(sitemap);
      }

      //    Owner & Tenants
      if (authorizedSitemaps['OwnerWorkOrder'] != null
          && authorizedSitemaps['OwnerWorkOrder'].allowAccessOrView) {
          let sitemap = this.sitemap['OwnerWorkOrder'];
          sitemap.route = '/pages/transactions/workorders/owner';
          this.newMenu.ownerTenants.push(sitemap);
      }

      if (authorizedSitemaps['TenantWorkOrder'] != null
          && authorizedSitemaps['TenantWorkOrder'].allowAccessOrView) {
          let sitemap = this.sitemap['TenantWorkOrder'];
          sitemap.route = '/pages/transactions/workorders/tenant';
          this.newMenu.ownerTenants.push(sitemap);
      }

      if (authorizedSitemaps['GuestWorkOrder'] != null
          && authorizedSitemaps['GuestWorkOrder'].allowAccessOrView) {
          let sitemap = this.sitemap['GuestWorkOrder'];
          sitemap.route = '/pages/transactions/workorders/guest';
          this.newMenu.ownerTenants.push(sitemap);
      }

      //    Utility Consumption
      if (authorizedSitemaps['UtilityConsumption'] != null
          && authorizedSitemaps['UtilityConsumption'].allowAccessOrView) {
          let sitemap = this.sitemap['UtilityConsumption'];
          sitemap.route = '/pages/transactions/consumptions';
          this.newMenu.utilities.push(sitemap);
      }
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
      this.errMsgChangePw = [];
      this.formGroupChangePw.reset()
      Object.keys(this.formGroupChangePw.controls).forEach(key => {
          this.formGroupChangePw.controls[key].markAsUntouched();
      });
      this.changeModal.show();
      
  }

  public submitPassword() {
      this.errMsgChangePw = [];

      console.log("form submit", this.formGroupChangePw);

      if (this.formGroupChangePw.valid) {

          // send request change password to server
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

          url_search_params.append('oldPassword', this.formGroupChangePw.get('oldPassword').value);
          url_search_params.append('newPassword', this.formGroupChangePw.get('newPassword').value);

          let cp_body = url_search_params.toString();
          console.log('Location Body URL encode', cp_body);

          this.http.post(add_url, cp_body, options).map(
              res => {
                  return res.json()
          }).subscribe(
              response => {
                  console.log('Response from server', response);
                  if (response.resultCode.code == "0") {
                      this.hideChangeModal();
                      GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                  } else {
                      this.errMsgChangePw = [];
                      this.errMsgChangePw = this.errMsgChangePw.concat(response.resultCode.message);
                      GrowlMessage.addMessage(MessageSeverity.ERROR, MessageLabels.SAVE_ERROR);
                  }
              }
           );
      } else {
          console.log("not valid");
          Object.keys(this.formGroupChangePw.controls).forEach(key => {
              this.formGroupChangePw.controls[key].markAsTouched();
          });
      }
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
    
    goToAllList(){
        this.isDropdownProfile = false;
        this.isDropdownNewmenu = false;
        this.isDropdownConfiguration = false;
        this.router.navigate(['/pages/all-list']);
    }
    goToUsers(){
        this.isDropdownProfile = false;
        this.isDropdownNewmenu = false;
        this.isDropdownConfiguration = false;
        this.router.navigate(['/pages/users']);
    }
    goToRoles(){
        this.isDropdownProfile = false;
        this.isDropdownNewmenu = false;
        this.isDropdownConfiguration = false;
        this.router.navigate(['/pages/role']);
    }
    goToAccessRights(){
        this.isDropdownProfile = false;
        this.isDropdownNewmenu = false;
        this.isDropdownConfiguration = false;
        this.router.navigate(['/pages/access-rights']);
    }
}
