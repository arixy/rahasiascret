import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { SelectModule } from 'ng2-select';

import { Dashboard } from './dashboard.component';
import { routing } from './dashboard.routing';
import { OpenWorkOrderCategoryChartComponent } from './openWOPerCategory/open-wo-category-chart.component';
import { OpenWorkOrderPICChartComponent } from './openWOPerPIC/open-wo-pic-chart.component';
import { WorkOrderWeeklyChartComponent } from './woWeeklyTrend/wo-weekly-chart.component';
import { WorkOrderCountComponent } from './woCount/wo-count.component';

import { PopularApp } from './popularApp';
import { PieChart } from './pieChart';
import { TrafficChart } from './trafficChart';
import { UsersMap } from './usersMap';
import { LineChart } from './lineChart';
import { Feed } from './feed';
import { Todo } from './todo';
import { Calendar } from './calendar';
import { CalendarService } from './calendar/calendar.service';
import { FeedService } from './feed/feed.service';
import { LineChartService } from './lineChart/lineChart.service';
import { PieChartService } from './pieChart/pieChart.service';
import { TodoService } from './todo/todo.service';
import { TrafficChartService } from './trafficChart/trafficChart.service';
import { UsersMapService } from './usersMap/usersMap.service';
import { OpenWorkOrderCategoryChartService } from './openWOPerCategory/open-wo-category-chart.service';
import { OpenWorkOrderPICChartService } from './openWOPerPIC/open-wo-pic-chart.service';
import { WorkOrderWeeklyChartService } from './woWeeklyTrend/wo-weekly-chart.service';
import { WorkOrderCountService } from './woCount/wo-count.service';
import { UsersService } from '../users/users.service';

import { TreeTableModule, TreeNode, ChartModule } from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
      routing,
      ChartModule,
      SelectModule
  ],
  declarations: [
    PopularApp,
    PieChart,
    TrafficChart,
    UsersMap,
    LineChart,
    Feed,
    Todo,
    Calendar,
      Dashboard,
      OpenWorkOrderCategoryChartComponent,
      OpenWorkOrderPICChartComponent,
      WorkOrderWeeklyChartComponent,
      WorkOrderCountComponent,
  ],
  providers: [
    CalendarService,
    FeedService,
    LineChartService,
    PieChartService,
    TodoService,
    TrafficChartService,
      UsersMapService,
      OpenWorkOrderCategoryChartService,
      OpenWorkOrderPICChartService,
      WorkOrderWeeklyChartService,
      WorkOrderCountService,
      UsersService
  ]
})
export class DashboardModule {}
