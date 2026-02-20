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
        let formControlName = fieldParts[fieldParts.length - 1];

        // Specific mappings for fields that are combined in backend but split in frontend
        if (formControlName === 'beginDatetime') {
            applyErrorToControl(form, 'beginDate', detail.message);
            applyErrorToControl(form, 'beginTime', detail.message);
            errorsMapped = true;
            return;
        }

        if (formControlName === 'finishDatetime') {
            applyErrorToControl(form, 'finishDate', detail.message);
            applyErrorToControl(form, 'finishTime', detail.message);
            errorsMapped = true;
            return;
        }

        if (applyErrorToControl(form, formControlName, detail.message)) {
            errorsMapped = true;
        }
    });

    return errorsMapped;
}

function applyErrorToControl(form: FormGroup, controlName: string, errorMessage: string): boolean {
    const control = form.get(controlName);
    if (control) {
        control.setErrors({
            ...control.errors,
            serverError: errorMessage
        });
        control.markAsTouched();
        return true;
    }
    return false;
}

