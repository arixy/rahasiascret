import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule as AngularFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { ReactiveFormsModule } from '@angular/forms';

import { routing }       from './preventatives.routing';

import { RatingModule } from 'ng2-bootstrap';
import { Preventatives } from './preventatives.component';
import { Inputs } from './components/inputs';
import { Layouts } from './components/layouts';

import { StandardInputs } from './components/inputs/components/standardInputs';
import { ValidationInputs } from './components/inputs/components/validationInputs';
import { GroupInputs } from './components/inputs/components/groupInputs';
import { CheckboxInputs } from './components/inputs/components/checkboxInputs';
import { Rating } from './components/inputs/components/ratinginputs';
import { SelectInputs } from './components/inputs/components/selectInputs';

import { InlineForm } from './components/layouts/components/inlineForm';
import { BlockForm } from './components/layouts/components/blockForm';
import { HorizontalForm } from './components/layouts/components/horizontalForm';
import { BasicForm } from './components/layouts/components/basicForm';
import { WithoutLabelsForm } from './components/layouts/components/withoutLabelsForm';

import { ModalModule } from 'ng2-bootstrap';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { SelectModule } from 'ng2-select';

@NgModule({
  imports: [
    CommonModule,
    AngularFormsModule,
    NgaModule,
    ReactiveFormsModule,
    RatingModule.forRoot(),
    routing,
    ModalModule.forRoot(),
    Ng2SmartTableModule
  ],
  declarations: [
    Layouts,
    Inputs,
    Preventatives,
    StandardInputs,
    ValidationInputs,
    GroupInputs,
    CheckboxInputs,
    Rating,
    SelectInputs,
    InlineForm,
    BlockForm,
    HorizontalForm,
    BasicForm,
    WithoutLabelsForm
  ]
})
export class PreventativesModule {
}
