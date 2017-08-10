import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ResetFilterComponent } from './reset-filter.component';

@NgModule({
  imports: [
      CommonModule
  ],
  declarations: [
      ResetFilterComponent
    ],
  exports: [
      ResetFilterComponent
    ]
})
export class ResetFilterModule {
}
