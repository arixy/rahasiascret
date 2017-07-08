import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { GlobalConfigs } from './../global.state';

@Injectable()
export class AssetService{
  private asset_data: any;

  redirectUrl: string;

    //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';
    private appUrl = GlobalConfigs.APP_MASTER_URL;
    private woUrl = GlobalConfigs.APP_BASE_URL;

  constructor(private http: Http){
      var first_elevator_id = UUID.UUID();
    this.asset_data = {
          "data": [
            {
              "isActive": true,
              "inactiveDate": null,
              "createdBy": 1,
              "dateCreated": "2017-05-05T01:43:51.000+0000",
              "updatedBy": 1,
              "dateUpdated": "2017-05-05T01:43:51.000+0000",
              "assetId": 1,
              "assetNumber": "ASSET-1",
              "name": "name",
              "description": "description",
              "specification": "specification",
              "relatedVendorId": 1,
              "parentAssetId": null,
              "locationId": 1,
              "woCategoryId": 1,
              "isRoot": true,
              "haveChild": true
            },
            {
              "isActive": true,
              "inactiveDate": null,
              "createdBy": 1,
              "dateCreated": "2017-05-05T01:43:51.000+0000",
              "updatedBy": 1,
              "dateUpdated": "2017-05-05T01:43:51.000+0000",
              "assetId": 2,
              "assetNumber": "J12E",
              "name": "J12E",
              "description": "description",
              "specification": "specification",
              "relatedVendorId": 1,
              "parentAssetId": 1,
              "locationId": 1,
              "woCategoryId": 1,
              "isRoot": true,
              "haveChild": false
            },
            {
              "isActive": true,
              "inactiveDate": null,
              "createdBy": 1,
              "dateCreated": "2017-05-05T01:43:51.000+0000",
              "updatedBy": 1,
              "dateUpdated": "2017-05-05T01:43:51.000+0000",
              "assetId": 3,
              "assetNumber": "ASSET-3",
              "name": "2nd Floor",
              "description": "description",
              "specification": "specification",
              "relatedVendorId": 1,
              "parentAssetId": null,
              "locationId": 1,
              "woCategoryId": 1,
              "isRoot": true,
              "haveChild": false
            }  
          ],
          "resultCode": {
            "code": "0",
            "message": ""
          }
        };
  }

  getAssets(): Observable<any> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var bearer = "Bearer " + localStorage.getItem('bearer_token');

    headers.append('Authorization', bearer);
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
    
    var options = new RequestOptions({headers: headers});
    var load_url = this.appUrl + '/asset/all';
      
    return this.http.get(load_url, options).map(this.extractData);
  }

  getAssetsNormal(){
      return this.asset_data;
  }

    getAssetsFilter(filter_data){
        
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.appUrl + '/asset/all';
        
        let formatted_object = {
                filters: {},
                first: 0,
                rows: 9999,
                globalFilter: '',
                multiSortMeta: null,
                sortField: 'dateUpdated',
                sortOrder: -1
        };
        if(filter_data){
           formatted_object = filter_data; 
        }
        
        return this.http.post(load_url, formatted_object, options).map(this.extractData);
    }

    getAssetsFake(): Observable<any>{
      return Observable.of(this.asset_data);
    }
    getWObyAsset(asset_id){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var bearer = "Bearer " + localStorage.getItem('bearer_token');

        headers.append('Authorization', bearer);
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

        var options = new RequestOptions({headers: headers});
        var load_url = this.woUrl + '/work-order/get-by-asset/' + asset_id;

        return this.http.get(load_url, options).map(this.extractData);    
    }
  private extractData(res: Response){
    let body = res.json();
    console.debug(body);
    return body || { };
  }
    addAsset(asset): Observable<any> {
        console.log('Adding Asset', asset);
        var headers = new Headers();
        //headers.append('Content-Type', 'multipart/form-data');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
        
        headers.delete('Content-Type');
        
        var options = new RequestOptions({
            headers: headers
        });

        var add_url = this.appUrl + '/asset/add';
        
        let asset_multipart = new FormData();
        let photo_file : File = null;

        if(asset.photo_file != null){
            photo_file = asset.photo_file[0];
        }
        var formatted_object = {
            asset: {
                name: asset.name,
                assetNumber: asset.asset_number,
                description: asset.description,
                specification: asset.specification,
                relatedVendorId: 1,
                parentAssetId: asset.parent_asset_id,
                locationId: asset.location_id,
                woCategoryId: asset.wocategory_id
            },
            assetPhotos: [
            ]
        
        }

        asset_multipart.append('params', JSON.stringify(formatted_object));
        //asset_multipart.append('files', []);
        /*
        asset_multipart.append('assetNumber', asset.assetNumber);
        asset_multipart.append('description',);
        asset_multipart.append('relatedVendorId', 1);
        asset_multipart.append('parentAssetId', );
        asset_multipart.append('locationId',);
        asset_multipart.append('woCategoryId',);*/

        return this.http.post(add_url, asset_multipart, options).map(this.extractData);
    }
    
    updateAsset(updated_asset): Observable<any>{
        
        console.log('Update Asset in Service', updated_asset);
        var headers = new Headers();
        //headers.append('Content-Type', 'multipart/form-data');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
        
        headers.delete('Content-Type');
        
        var options = new RequestOptions({
            headers: headers
        });

        let asset_multipart = new FormData();
        
        var update_url = this.appUrl + '/asset/update';
        var formatted_object = {
            asset: {
                assetId: updated_asset.id,
                assetNumber: updated_asset.asset_number,
                name: updated_asset.name,
                description: updated_asset.description,
                specification: updated_asset.specification,
                relatedVendorId: 1,
                parentAssetId: updated_asset.parent_asset_id,
                locationId: updated_asset.location_id,
                woCategoryId: updated_asset.wocategory_id,
                isActive: true
            },
            assetPhotos:[],
            deletedPhotosId:[]
        };

        asset_multipart.append('params', JSON.stringify(formatted_object));
        //asset_multipart.append('files', []);
        /*
        asset_multipart.append('assetNumber', asset.assetNumber);
        asset_multipart.append('description',);
        asset_multipart.append('relatedVendorId', 1);
        asset_multipart.append('parentAssetId', );
        asset_multipart.append('locationId',);
        asset_multipart.append('woCategoryId',);*/

        return this.http.post(update_url, asset_multipart, options).map(this.extractData);
    }
    deleteAsset(asset_id): Observable<any> {
        var headers = new Headers();
		headers.append('Content-Type', 'application/x-www-form-urlencoded');
		headers.append('Authorization', 'Bearer ' + localStorage.getItem('bearer_token'));
		headers.append('Access-Control-Allow-Origin', '*');
		headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');

		var options = new RequestOptions({
			headers: headers
		});

		var delete_url = this.appUrl + '/asset/delete';

		var delete_body = "assetId=" + asset_id;
		console.log('test service delete', delete_body);
		return this.http.post(delete_url, delete_body, options).map(this.extractData);
    }
    
    get(asset_id){
        return this.asset_data.find(
            (asset_data) => {
                return asset_data.id == asset_id;
            }
        );
    }

}
