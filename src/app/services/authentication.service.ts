import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthenticationService{
  //private authUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/auth/login';
    //private authUrl = 'http://ems.kurisutaru.net/api/v1/auth/login';
    private authUrl = 'http://192.168.1.252/api/v1/auth/login';
  private data: any;
  private users = [
      {
          email: 'usera@gmail.com',
          password: 'password'
      },
      {
          email: 'userb@gmail.com',
          password: 'password'
      }
  ];
  public login_verified;
  private client_id: string = "f3d259ddd3ed8ff3843839b";
  private client_secret: string = "4c7f6f8fa93d59c45502c0ae8c4a95b";
  redirectUrl: string;

  constructor(private http: Http){
    this.data = null;
  }

  check(): boolean {
    if(localStorage.getItem('bearer_token')){
        console.log('True Check');
      return true;
    }
    console.log('False Check');
    return false;
  }

  postLogin(user): any {
    let data = JSON.stringify(user);
    //alert(data);

    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
      
    var creds = "username=" + user.email + "&password=" + user.password;
    //alert(creds);
    var options = new RequestOptions({headers: headers});

    return this.http.post(this.authUrl, creds, options)
      .map(this.extractData);
    // NOTE: Changed to accommodate Demo. Real api code commented out
    /*this.users.map(
        (user_data) => {
            if(user_data.email == user.email && user_data.password == user.password ){
                localStorage.setItem('bearer_token', 'randomdata');
                localStorage.setItem('logged_user', user_data.email);
            }
        }
    );

    return true;*/
  }


  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
  postLogout(): void {
    localStorage.removeItem('bearer_token');
    localStorage.setItem('logged_user', null);
  }

}
