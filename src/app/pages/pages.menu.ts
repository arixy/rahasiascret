export const PAGES_MENU = [
  {
    path: 'pages',
    children: [
      {
        path: 'dashboard',
        data: {
          menu: {
            title: 'Dashboard',
            icon: 'ion-android-home',
            selected: false,
            expanded: false,
            order: 0
          }
        }
      },
    /* {
        path: 'schedules',
        data: {
            menu: {
                title: 'Schedules',
                icon: 'ion-calendar',
                selected: false,
                expanded: false,
                order: 176
            }
        }
    }, */
    {
        path: 'tasks',
        data: {
            menu: {
                title: 'My Tasks',
                icon: 'ion-ios-checkmark-outline',
                selected: false,
                expanded: false,
                order: 176
            }
        }
    },
    {
        path: 'transactions',
        data: {
            menu: {
                title: 'Transactions',
                icon: 'ion-ios-barcode',
                selected: false,
                expanded: false,
                order: 176
            }
        },
        pathMatch: 'prefix',
        children: [
            /*{
                path: 'workorders/single',
                pathMatch: 'partial',
                data: {
                    menu: {
                        title: 'Work Orders',
                        hidden: true
                    }
                }
            },*/
            {
                path: 'workorders',
                pathMatch: 'partial',
                data: {
                    menu: {
                    title: 'Work Orders',
                    }
                },
            },
            {
                path: 'consumptions',
                data: {
                  menu: {
                    title: 'Consumptions',
                  }
                }
            }
          
        ]
    },
    {
        path: 'assets',
        data: {
            menu: {
                title: 'Asset',
                icon: 'ion-ios-barcode-outline',
                selected: false,
                expanded: false,
                order: 176
            }
        }
    },
      {
          path: 'reports',
          data: {
              menu: {
                  title: 'Reports',
                  icon: 'ion-clipboard',
                  selected: false,
                  expanded: false,
                  order: 177
              }
          }
      },
    {
          path: 'users',
          data: {
              menu: {
                  title: 'Users',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
    {
          path: 'role',
          data: {
              menu: {
                  title: 'Roles',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
        {
          path: 'weekends',
          data: {
              menu: {
                  title: 'Weekends & Holidays',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
        {
          path: 'entities',
          data: {
              menu: {
                  title: 'Entities',
                  pathMatch: 'prefix',
                  hidden: true
              }
          },
          pathMatch: 'prefix',
          children: [
              {
                path: '1',
                pathMatch: 'partial',
                data: {
                    menu: {
                        title: 'Vendors',
                        hidden: true
                    }
                },
            },
            {
                path: '2',
                pathMatch: 'partial',
                data: {
                    menu: {
                        title: 'Tenants',
                        hidden: true
                    }
                },
            },
            {
                path: '3',
                pathMatch: 'partial',
                data: {
                    menu: {
                        title: 'Guests',
                        hidden: true
                    }
                },
            },
            {
                path: '4',
                pathMatch: 'partial',
                data: {
                    menu: {
                        title: 'Owners',
                        hidden: true
                    }
                },
            },
          ]
      },
        {
          path: 'utility-types',
          data: {
              menu: {
                  title: 'Utility Types',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
        {
          path: 'priorities',
          data: {
              menu: {
                  title: 'WO Priorities',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
        {
          path: 'expense-type',
          data: {
              menu: {
                  title: 'Expense Types',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
        {
          path: 'utility-uom',
          data: {
              menu: {
                  title: 'Utility UOM',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
        {
          path: 'all-list',
          data: {
              menu: {
                  title: 'All List',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
      {
          path: 'setups',
          data: {
              menu: {
                  title: 'Setups',
                  icon: 'ion-gear-a',
                  selected: false,
                  expanded: false,
                  order: 150,
                  pathMatch: 'prefix',
                  hidden: true
              }
          },
          children: [
          {
            path: 'locations',
            data: {
              menu: {
                title: 'Unit/Location',
                pathMatch: 'prefix',
                hidden: true
              }
            }
          },
          {
            path: 'work-orders',
            data: {
              menu: {
                title: 'WO Categories',
                pathMatch: 'prefix',
                hidden: true
              }
            }
          }
          
        ]
      },
      {
          path: 'access-rights',
          data: {
              menu: {
                  title: 'Access Rights',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
      {
          path: 'wo-report',
          data: {
              menu: {
                  title: 'Reports - Work Order Report',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
      {
          path: 'consumption-report',
          data: {
              menu: {
                  title: 'Reports - Consumption Report',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
      {
          path: 'performance-report',
          data: {
              menu: {
                  title: 'Reports - Performance Report',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
      {
          path: 'settings',
          data: {
              menu: {
                  title: 'Settings',
                  pathMatch: 'prefix',
                  hidden: true
              }
          }
      },
    {
        path: 'access-denied',
        data: {
            menu: {
                title: 'Access Denied',
                icon: 'ion-ios-checkmark-outline',
                selected: false,
                expanded: false,
                order: 176,
                hidden: true
            }
        }
    },
    ]
  }
];
