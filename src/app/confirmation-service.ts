import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {ConfirmationDialogComponent} from "components/dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(private dialog: MatDialog, private http: HttpClient) {
  }

  confirmDelete(endpoint: string, id: number): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: {}
    });

    return new Observable<boolean>((observer) => {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.http.delete(`${endpoint}/${id}`).subscribe(
            () => {
              observer.next(true);
              observer.complete();
            },
            () => {
              observer.next(false);
              observer.complete();
            }
          );
        } else {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
