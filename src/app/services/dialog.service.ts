import { Observable } from 'rxjs/Rx';
import { ConfirmDeleteDialog } from './../confirm-delete.dialog';
import { MdDialogRef, MdDialog, MdDialogConfig } from '@angular/material';
import { Injectable } from '@angular/core';
import { TooltipModule } from 'primeng/primeng';

@Injectable()
export class DialogsService {

    constructor(private dialog: MdDialog) { }

    
    public confirmDelete(title: string, message: string): Observable<boolean>{
        console.log('Testing');
        let dialogRef: MdDialogRef<ConfirmDeleteDialog>;
        dialogRef = this.dialog.open(ConfirmDeleteDialog, {
            width: '400px'
        });
        
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        
        return dialogRef.afterClosed();
    }
	
}