import { Routes, RouterModule }  from '@angular/router';

import { Forms } from './forms.component';
import { Locations } from './components/locations/locations.component';
import { WorkOrders } from './components/work-orders/work-orders.component';

// noinspection TypeScriptValidateTypes
const routes: Routes = [
  {
    path: '',
    component: Forms,
    children: [
      { path: 'locations', component: Locations },
      { path: 'work-orders', component: WorkOrders }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
