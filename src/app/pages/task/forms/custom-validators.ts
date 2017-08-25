import { FormGroup, AbstractControl, FormBuilder, Validators, ValidatorFn, FormControl } from '@angular/forms';
import { GlobalConfigs } from './../../../global.state';

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

    public static requiredSelectBox(input: FormControl) {
        if (input != null) {
            if (input.value == null
                || input.value == ""
                || input.value.id == null
                || input.value.id == GlobalConfigs.DEFAULT_SELECT_OPTION.id) {
                return { required: true }
            }
        }

        return null;
    }
}