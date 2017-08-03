import {Component} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

import 'style-loader!./login.scss';

@Component({
  selector: 'login',
  templateUrl: './login.html',
})
export class Login {

  public form:FormGroup;
  public email:AbstractControl;
  public password:AbstractControl;
  public submitted:boolean = false;
  public message :string = '';
  public response;

  constructor(
      public fb:FormBuilder,
      private authService: AuthenticationService,
      public router: Router
             ) {
    this.form = fb.group({
      'email': ['', Validators.compose([Validators.required])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.email = this.form.controls['email'];
    this.password = this.form.controls['password'];
  }

  public onSubmit(values:any):void {
    this.submitted = true;
    if (this.form.valid) {
        console.log(values);
      // your code goes here
        this.response = this.authService.postLogin(values).subscribe(
          data => {
                    this.saveOAuthToken(data.data.token);
                    localStorage.setItem('logged_user', data.data.email);
                    // added by Mike: authorization & sitemaps
                    localStorage.setItem('authorizedSitemaps', JSON.stringify(this.processAuthorization(data.data.authorizations)));
                    localStorage.setItem('sitemaps', JSON.stringify(this.processSitemap(data.data.sitemaps)));
                  },
          err => {
              this.message = 'Please check your username / password';
              console.log('something wrong')
          },
          () => {
                  if(this.authService.check()){
                    this.message = 'Login Successful';
                    let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/pages/dashboard';
                    console.log(redirect);
                    this.router.navigate([redirect]);
                  }
            }
        );
        // NOTE: Changed to accommodate Demo. Real code above
        /*this.response = this.authService.postLogin(values);
        if(this.authService.check()){
            this.message = 'Login Successful';
                    let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/pages/dashboard';
                    console.log(redirect);
                    this.router.navigate([redirect]);
        } else {
            this.message = 'Please check your email / password';
        }
        console.log(this.response);*/
        
    }
  }

saveOAuthToken(oauth_token){
    if(oauth_token){
      localStorage.setItem('bearer_token', oauth_token);
    }
  }
  processAuthorization(authorization) {
      let processedAuthorization = {};
      if(authorization != null){
            for (let auth of authorization) {
                processedAuthorization[auth.menuId] = auth;
            }
            console.error("processedAuthorization", processedAuthorization);
      }
      return processedAuthorization;
  }
  processSitemap(sitemap) {
      let processedSitemap = {};
      if(sitemap != null){
            for (let map of sitemap) {
                processedSitemap[map.menuId] = map;
            }
            console.error("processedSitemap", processedSitemap);
      }
      return processedSitemap;
  }
}
