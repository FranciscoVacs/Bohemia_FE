import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService extends ErrorHandler {
  constructor(private snackBar: MatSnackBar) {
    super();
  }
  override handleError(error: any): void {

       let errorMessage = '';
      if (error instanceof HttpErrorResponse){
        errorMessage = `Error ${error.status}: ${error.statusText}`
      }
      else {
      errorMessage = `Non-HTTP error: ${error.statusText}` 
      }
      this.snackBar.open(errorMessage, 'Dismiss', { duration: 3000 });
      console.error(errorMessage, error)
  }
}
