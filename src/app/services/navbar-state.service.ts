import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NavbarStateService {
    // Purchase step: 0 = not on purchase page, 1-3 = purchase steps
    private _purchaseStep = signal<number>(0);
    public readonly purchaseStep = this._purchaseStep.asReadonly();

    setPurchaseStep(step: number): void {
        this._purchaseStep.set(step);
    }

    clearPurchaseStep(): void {
        this._purchaseStep.set(0);
    }
}
