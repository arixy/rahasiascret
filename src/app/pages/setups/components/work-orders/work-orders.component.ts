import {Component, Input, ChangeDetectorRef, ViewChild, ViewEncapsulation, OnInit} from '@angular/core';
import { WorkOrderService } from '../../../../services/work-order.service';
import { KPIBaselineDurationService } from '../../../../services/kpi-baseline-duration.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { FormControl, FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { LocalDataSource } from 'ng2-smart-table';
import { ModalDirective } from 'ng2-bootstrap';
import { DataTable } from 'primeng/primeng';
import { SelectComponent } from 'ng2-select';
import { GrowlMessage, MessageSeverity, MessageLabels } from '../../../../popup-notification';

@Component({
  selector: 'inputs',
  templateUrl: './work-orders.html',
  styleUrls: ['./../../../styles/basic-theme.scss', './../../../styles/primeng.min.css','./workorders.scss', './modals.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkOrders {

    @ViewChild('childModal') childModal: ModalDirective;
    @ViewChild('childModalEdit') childModalEdit: ModalDirective;
    @ViewChild('addSelectBox') addSelectBox: SelectComponent;
    @ViewChild('dt') woCategoriesTable: DataTable;
     
    public work_orders;
    public work_orders$: Observable<any>;
    public form;
    public name;
    public description;
    public prefix;
    public kpi_baseline;
    public submitted;    
    public editForm;
    public edit_name;
    public edit_description;
    public edit_prefix;
    public edit_kpi_baseline; 
    public items_location;
    public items_kpi_baseline;
    public kpi_baseline_durations = null;
    public edit_id;
    public selected_kpi = null;
    private totalRecords;
    public modalLoading = false;
    public add_form_submitted = false;
    public edit_form_submitted = false;
     
    error_from_server = [];
     
     // Loading States
     dataLoading = false;
     
     // Filtering Stuffs
     filter_name_fc = new FormControl();
     filter_description_fc = new FormControl();
     
     filter_master = {
        "name": {
            "matchMode": "undefined",
            "value": ""
        },
        "description": {
            "matchMode": "undefined",
            "value": ""
        }
  };
     
     testHidden = false;
  public location_editwo = {
      id:null,
      name:'',
      description:'',
      prefix:'',
      kpi_baseline:'',
  //  parent_wo_id: null
  };
     
  @Input() public source: LocalDataSource = new LocalDataSource();
  
     
  constructor(
    public woService: WorkOrderService,
    public kpiBaselineService: KPIBaselineDurationService,
    public fb: FormBuilder,
    public cdr: ChangeDetectorRef
    ) {
        this.form = fb.group({
      'name': ['', Validators.compose([Validators.required])],
      'description': ['', Validators.compose([Validators.required])],
        'prefix': ['', Validators.compose([Validators.required])],
        'kpi_baseline': ['', Validators.compose([Validators.required])]
    });
    this.editForm = fb.group({
        'edit_name':['',
         Validators.compose([Validators.required])],
      'edit_description': ['', Validators.compose([Validators.required])],
        'edit_prefix': ['', Validators.compose([Validators.required])],
        'edit_kpi_baseline': ['', Validators.compose([Validators.required])]   
    });  

      this.name = this.form.controls['name'];
      this.description = this.form.controls['description'];
      this.prefix = this.form.controls['prefix'];
      this.kpi_baseline = this.form.controls['kpi_baseline'];
      
    
      this.edit_name = this.editForm.controls['edit_name'];
      this.edit_description = this.editForm.controls['edit_description'];
      this.edit_prefix = this.editForm.controls['edit_prefix'];
      this.edit_kpi_baseline = this.editForm.controls['edit_kpi_baseline'];
      
      
  }
     
     
    ngOnInit(){
        
        // Data Entry is called on OnInit so that it can be easily called again to refresh data
        /*this.work_orders$ = this.woService.getWOs();
        this.work_orders$.subscribe(
            (data) => {
                this.work_orders = data.data;
                console.log('Loaded WO Category', this.work_orders);
                
            }
        );*/
        this.refresh(this.filter_master, this.woCategoriesTable);
        
        this.kpiBaselineService.getKPIBaselines().subscribe(
            (data) => {
                this.kpi_baseline_durations = data.data;
                console.log('Kpi Baseline Duration', this.kpi_baseline_durations);
                
                // Transform to Select Items
                this.items_kpi_baseline = this.kpi_baseline_durations.map(
                    (kpi_baseline) => {
                        return Object.assign({}, {
                           id: kpi_baseline.kpiBaselineDurationId,
                            text: kpi_baseline.name
                        });
                    }
                );
    
            }
        );
        
    }
     
     ngAfterViewInit(){
         
         // Set manual filter debounce
        this.filter_name_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.name = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.woCategoriesTable);
                }
                
        );
         
         this.filter_description_fc.valueChanges
            .debounceTime(800)
            .distinctUntilChanged()
            .subscribe(
                (filter_text) => {
                    this.filter_master.description = {
                        matchMode: 'undefined',
                        value: filter_text
                    };
                    this.refresh(this.filter_master, this.woCategoriesTable);
                }
                
        );
     }
     
     public clearFormInputs(form){
        form.reset();
     }
     
     public hideModal(){
        this.childModalEdit.hide();
        this.childModal.hide();
    }
     
     public cancel(){
        this.hideModal();
        
        // Maybe some other logic to reset the form
        // Clear all input in the form
        this.clearFormInputs(this.form);
                    
        // Specific clearing for add select boxes
        this.addSelectBox.active = [];
        this.addSelectBox.ngOnInit();

    }
     
    refresh(filter_master, table: DataTable){
        
        this.dataLoading = true;
        
        // The only custom element is the filter master since we want to implement debounce
        var formatted_object = {};
        
        if(table == null){
            formatted_object = {
                filters : filter_master,
                first: 0,
                rows: 10,
                globalFilter: "",
                multiSortMeta: null,
                sortField: 'name',
                sortOrder: -1
            }
        } else {
            formatted_object = {
                filters : filter_master,
                first: table.first,
                rows: table.rows,
                globalFilter: table.globalFilter,
                multiSortMeta: table.multiSortMeta,
                sortField: table.sortField,
                sortOrder: table.sortOrder    
            }
            
        }
        
        console.log('Shoot Refresh', formatted_object);
        this.woService.getWOCategoriesFilter(formatted_object).subscribe(
            (response) => {
                this.dataLoading = false;
                console.log('Refresh Data', response);
                this.work_orders = response.data;

                if(response.paging != null){
                    this.totalRecords = response.paging.total;
                } else {
                    this.totalRecords = 0;
                }
            }
        );
    } 
     
    public onSubmit(values:any):void {
        this.submitted = true;
        this.add_form_submitted = true;
         console.log('create component');
        if (this.form.valid) {
            this.modalLoading = true;
            // Select Box Processing
            values.kpi_baseline_duration_id = this.selected_kpi;

            console.log('onSubmit Values', values);

            this.woService.addWO(values).subscribe(
                (data) => {
                    this.modalLoading = false;
                    console.log('Return Data', data);
                    if(data.resultCode.code == 0){
                        GrowlMessage.addMessage(MessageSeverity.SUCCESS, MessageLabels.SAVE_SUCCESS);
                        this.childModal.hide();
                        // Refresh Data
                        this.ngOnInit();
                        this.add_form_submitted = false;
                        
                    } else {
                        this.error_from_server = [];
                        this.error_from_server = this.error_from_server.concat(data.resultCode.message);
                    }
                    
                    //TODO: Refresh Must Be Here
                }
            );


        }
  }

   public onSubmitEdit(values,event) {
       console.log('edit component',values);
       if(this.editForm.valid) {
        
           var formatted_object = Object.assign({}, {
                id: this.edit_id,
                name: values.edit_name,
                description: values.edit_description,
                prefix:values.edit_prefix,
                kpi_baseline:values.edit_kpi_baseline
            });
           
           this.woService.updateWOCategory(formatted_object).subscribe(
                (data) => {
                    console.log('Response Data', data);
                    this.childModalEdit.hide();

                    // Refresh Data
                    this.ngOnInit();
                }
           );
                        
        
        }
  }
     
    public addWOCategory(){
        this.childModal.show();
    }
     public hideChildModal(){
         this.childModal.hide();
     }

    public deleteWOCategory(event){
        console.log('delete', event);
        console.log(event.woCategoryId);
        this.woService.deleteWorkOrder(event.woCategoryId).subscribe(
            (data) => {
                console.log('Return Data', data);
                this.ngOnInit();
            }
        );
    }
     
    public onDeleteConfirm(event): void {
        if (window.confirm('Are you sure you want to delete?')) {
          event.confirm.resolve();
        } else {
          event.confirm.reject();
        }
      }
     
    public editWOCategory(wo_category){
        console.log('Editing',wo_category);
        
        this.edit_id = wo_category.woCategoryId;
        this.editForm.patchValue(
            {   
                edit_name: wo_category.name,
                edit_description: wo_category.description,
                edit_prefix: wo_category.prefix,
                edit_kpi_baseline: wo_category.kpiBaseline
            }
        );
        

       this.childModalEdit.show();
    }

    public hideChildModalEdit(){
        this.childModalEdit.hide();
    }
     
     public selectedKPIBaseline(event){
         this.selected_kpi = event.id;
         console.log(event);
     }
     
     public resetFilters(){
        
        // Clear all filter in filter master. Might be Redundant
        this.filter_master.name.value = "";
        this.filter_master.description.value = "";
        // Actually changing the value on the input field. Auto Refresh
        this.filter_name_fc.setValue("");
        this.filter_description_fc.setValue("");
    }
}  
