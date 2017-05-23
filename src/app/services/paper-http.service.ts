import { Injectable } from '@angular/core';
import { Http, XHRBackend, RequestOptions, Request, RequestOptionsArgs, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
//import { NotifierDialogsService } from './../notifiers/notifier-dialog.service';

@Injectable()
export class PaperHttp extends Http {

    
  // NOTE from EDO: Bikin config properties untuk retry berapa kali etc    
  constructor (backend: XHRBackend, options: RequestOptions
  ) {  
    super(backend, options);
    //notifierDialogService.testLog();
  }

  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
      
    let token = localStorage.getItem('bearer_token');
    if (typeof url === 'string') { 
        // meaning we have to add the token to the options, not in url
      if (!options) {
        // let's make option object
        options = {headers: new Headers()};
      }
      options.headers.set('Authorization', `Bearer ${token}`);
        
    } else {
        
    // we have to add the token to the url object
      url.headers.set('Authorization', `Bearer ${token}`);
    }
    return super.request(url, options)
        .catch(
            (err: Response, caught: Observable<any>) => {
                console.log('Observable Caught', err);
                if (err.status === 401) {
                    console.log('Error?', err);
                    //this.authService.postLogout();
                    //this.notifierDialogService.tokenExpired('Token Expired / Invalid', 'Token Autentikasi Anda sudah expired. Silahkan melakukan Login ulang atau Registrasi')

                    // No Need to Retry when 401
                    return Observable.empty();
                }
                if (err.status > 401 && err.status < 499){
                    //this.notifierDialogService.tokenExpired('Ada Kesalahan dalam Request', 'Tolong Cek koneksi data Anda / contact customer service Paper');
                    
                    return Observable.empty();
                }
                return Observable.throw(caught); // <-----
                //return Observable.empty();
            }
        )
        .retry(3)
        .finally(
            () => {
                console.log('After Requests');
            }
        );
      
      // NOTE from EDO: Retry bisa bikin di sini coba liat link yang dikirim EDO. Mungkin retry perlu pengecekan di backend hashing untuk compare dua terakhir terutama dalam kasus ADD supaya ga double
  }

  private catchAuthError (self: PaperHttp) {
    // we have to pass HttpService's own instance here as `self`
    return (res: Response) => {
      console.log(res);
      if (res.status === 401 || res.status === 403) {
        
        console.log('Error Here', res);  
        // if not authenticated
        /*this.notifierDialogService.tokenExpired('Token Expired', 'Random Message').subscribe(
            response => {
                console.log('Response from Notifier', response);
            }
        );*/
        //this.notifierDialogService.testLog()
        
      }
      return Observable.throw(res);
    };
  }
}