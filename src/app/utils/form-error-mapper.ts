import { FormGroup } from '@angular/forms';

/**
 * Maps Zod validation errors from the backend to an Angular FormGroup.
 * 
 * @param error HTTP error response object
 * @param form Angular FormGroup to apply errors to
 * @returns boolean true if specific Zod errors were mapped, false otherwise
 */
export function mapZodErrorsToForm(error: any, form: FormGroup): boolean {
    if (!error?.error?.details || !Array.isArray(error.error.details)) {
        return false;
    }

    let errorsMapped = false;
    const errorDetails: { field: string, message: string }[] = error.error.details;

    errorDetails.forEach(detail => {
        // Backend field comes like "body.eventName", "body.email", "params.id", etc.
        const fieldParts = detail.field.split('.');

        // Get the actual field name by taking the last part (e.g., "eventName" from "body.eventName")
        const formControlName = fieldParts[fieldParts.length - 1];

        const control = form.get(formControlName);

        if (control) {
            // Set the 'serverError' validation error on the control
            control.setErrors({
                ...control.errors, // Keep existing errors
                serverError: detail.message
            });
            // Mark as touched so validation UI shows up immediately
            control.markAsTouched();
            errorsMapped = true;
        }
    });

    return errorsMapped;
}
