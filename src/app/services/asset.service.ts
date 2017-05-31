import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { GlobalConfigs } from '../global.state';
@Injectable()
export class AssetService{
  private asset_data: any;

  redirectUrl: string;

  //private appUrl = 'http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master/';
  private appUrl = GlobalConfigs.APP_BASE_URL + "/master/";

  constructor(private http: Http){
      var first_elevator_id = UUID.UUID();
    this.asset_data = [
        {
            id: first_elevator_id,
            name: 'Elevator',
            description: 'Elevator Object use to up and down people',
            photo: '',
            specification: 'speed: 10m/s',
            location_id: null,
            wocategory_id: null,
            parent_asset_id: null
        },
        {
            id: UUID.UUID(),
            name: 'Elevator MDX',
            description: 'Elevator object type MDX specific',
            photo: '',
            specification: 'speed: 15m/s',
            location_id: null,
            wocategory_id: null,
            parent_asset_id: first_elevator_id
        },
        {
            id: UUID.UUID(),
            name: 'Lamp',
            description: 'Lamps Object around the mall',
            photo: '',
            specification: 'model: light model',
            location_id: null,
            wocategory_id: null,
            parent_asset_id: null
        }
        
    ];
  }

  getAssets(): Observable<any> {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    var bearer = "Bearer " + localStorage.getItem('bearer_token');

    headers.append('Authorization', bearer);
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'DELETE, HEAD, GET, OPTIONS, POST, PUT');
    
    var options = new RequestOptions({headers: headers});
    var load_url = this.appUrl + 'asset/all';
      
    return this.http.get(load_url, options).map(this.extractData);
  }

    getAssetsNormal(){
      return this.asset_data;
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

        var add_url = this.appUrl + 'asset/add';
        
        let asset_multipart = new FormData();
        let photo_file : File = null;

        if(asset.photo_file != null){
            photo_file = asset.photo_file[0];
        }
        

        asset_multipart.append('params', {
            asset: {
                name: asset.name,
                assetNumber: "YOS1002",
                description: asset.description,
                specification: asset.specification,
                relatedVendorId: 1,
                parentAssetId: asset.parent_asset_id,
                locationId: asset.location_id,
                woCategoryId: asset.wocategory_id
            },
            assetPhotos: [
            ]
        
        });
        asset_multipart.append('files', []);
        /*
        asset_multipart.append('assetNumber', asset.assetNumber);
        asset_multipart.append('description',);
        asset_multipart.append('relatedVendorId', 1);
        asset_multipart.append('parentAssetId', );
        asset_multipart.append('locationId',);
        asset_multipart.append('woCategoryId',);*/

        return this.http.post(add_url, asset_multipart, options).map(this.extractData);
    }

    updateAsset(updated_asset){
      this.asset_data = this.asset_data.map(
        (asset) => {
            if(asset.id == updated_asset.id){
                console.log('Matching', asset.id);
                console.log('Updated Location', updated_asset);
                let updated_object = Object.assign({}, {
                    id: updated_asset.id,
                    name: updated_asset.name,
                    description: updated_asset.description,
                    photo: updated_asset.photo,
                    specification: updated_asset.specification,
                    parent_asset_id: updated_asset.parent_asset_id,
                    location_id: updated_asset.location_id,
                    wocategory_id: updated_asset.wocategory_id
                });
                console.log('Updated Object', updated_object);
                return updated_object;
            }
            return asset;
        }
      );
      console.log('Latest', this.asset_data);
      return true;
    }
    deleteAsset(asset_id): boolean {
        return false;
    }
    
    get(asset_id){
        return this.asset_data.find(
            (asset_data) => {
                return asset_data.id == asset_id;
            }
        );
    }

}
