import { MdDialogRef } from '@angular/material';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'confirm-delete',
    templateUrl: './confirm-delete.dialog.html',
})
export class ConfirmDeleteDialog implements OnDestroy {

    public title: string;
    public message: string;
    
    result;
    new_payment;

    constructor(
            public dialogRef: MdDialogRef<ConfirmDeleteDialog>
    ) {
        

         console.log('test console', this.title);
                
    }
    
    ngOnInit(){
        console.log('Message', this.message);
    }
    ngOnDestroy(){
        
        console.log('Destroyed/Closed');
        
    }
    confirmDelete(){
        console.log('Confirm Delete');
        this.dialogRef.close(true);
    }
    cancelDelete(){
        this.dialogRef.close(false);
    }
}