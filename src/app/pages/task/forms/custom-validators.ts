import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, FormControl } from '@angular/forms';

export class CustomValidators {
    public static numberOnly(input: FormControl) {
        if (input != null && input.value != null) {
            for (var i = 0; i < input.value.length; i++) {
                if (input.value.charAt(i) < '0' || input.value.charAt(i) > '9') {
                    // if any char is outside number 0-9
                    return { nonnumber: true };
                }
            }
        }

        return null;
    }
}