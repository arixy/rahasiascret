import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

@Injectable()
export class GlobalState {

  private _data = new Subject<Object>();
  private _dataStream$ = this._data.asObservable();

  private _subscriptions: Map<string, Array<Function>> = new Map<string, Array<Function>>();

  constructor() {
    this._dataStream$.subscribe((data) => this._onEvent(data));
  }

  notifyDataChanged(event, value) {

    let current = this._data[event];
    if (current !== value) {
      this._data[event] = value;

      this._data.next({
        event: event,
        data: this._data[event]
      });
    }
  }

  subscribe(event: string, callback: Function) {
    let subscribers = this._subscriptions.get(event) || [];
    subscribers.push(callback);

    this._subscriptions.set(event, subscribers);
  }

  _onEvent(data: any) {
    let subscribers = this._subscriptions.get(data['event']) || [];

    subscribers.forEach((callback) => {
      callback.call(null, data['data']);
    });
  }
}
export class GlobalConfigs {
    public static readonly APP_BASE_URL = "http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1";
    public static readonly APP_MASTER_URL = "http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/master";
    public static readonly APP_AUTH_URL = "http://ec2-52-40-147-30.us-west-2.compute.amazonaws.com/api/v1/auth";

    // used for ng-prime date picker year range
    public static readonly yearRange = '1970:2100';
    public static readonly DEFAULT_ITEM_PER_PAGE = 10;
    public static readonly DEFAULT_SELECT_OPTION = { id: -9999, text: '-- Please Select --' };
}
export class WorkflowActions {
    public static readonly CREATE = -1;
    public static readonly VIEW = -2;
    public static readonly PRINT = -3;
    public static readonly EDIT = 2;
    public static readonly DELETE = 3;
    public static readonly ASSIGN_REASSIGN = 4;
    public static readonly CANCEL = 5;
    public static readonly PENDING = 6;
    public static readonly IN_PROGRESS = 7;
    public static readonly CLOSE_FOR_CONFIRMATION = 8;
    public static readonly COMPLETE = 9;
    public static readonly RETURN = 10;
    public static readonly CANCEL_SCHEDULE = 12;
}
export class WorkOrderStatuses {
    public static readonly SCHEDULED = 0;
    public static readonly BACKLOG = 1;
    public static readonly NEW = 2;
    public static readonly IN_PROGRESS = 3;
    public static readonly CLOSE_FOR_CONFIRMATION = 4;
    public static readonly COMPLETE = 5;
    public static readonly CANCEL = 6;
    public static readonly PENDING = 7;
    public static readonly ESCALATE = 8;
    public static readonly RETURN = 9;
}