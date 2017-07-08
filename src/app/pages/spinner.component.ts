import { Component, HostBinding, trigger, transition, animate, style, state } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'spinner',
    templateUrl: './spinner.component.html',
	styleUrls: ['./spinner.component.css']
})

export class SpinnerComponent implements OnInit {
	
 @HostBinding('style.position') get position(){
     return 'absolute';
 }
  @HostBinding('style.top') get top(){
      return '50%';
  }
   @HostBinding('style.left') get left(){
       return '50%';
   }
    @HostBinding('style.width') get width(){
        return '100%';
    }
     @HostBinding('style.height') get height(){
         return '100%';
     }
      @HostBinding('style.transform') get transform(){
          return 'translate(-50%, -50%)';
      }
      @HostBinding('style.background') get background(){
          return 'rgba(255,255,255,0.8)';
      }
       @HostBinding('style.z-index') get zindex(){
           return '5000';
       }
 constructor (
  ){
 }


  ngOnInit(): void {
    
  }

}