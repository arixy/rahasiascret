import { Component, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalState } from '../../../global.state';
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

    private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/auth/';
  public oldpassword;
  public newpassword;
  public loggedUser;
  public isDropdownProfile = false;
  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;
  public isDropdownNewmenu:boolean = false;
  public isDropdownConfiguration:boolean = false;

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
