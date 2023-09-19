import {AsyncTableElementReactiveForms} from './async-table-element-reactive-forms';
import {AsyncTableElementTemplateDriven} from './async-table-element-template-driven';

export class AsyncTableElementFactory {

  public static createTableElement(newElement: any): any {
    if (this.isValidatorDefined(newElement)) {
      // Create reactive forms element here.
      return new AsyncTableElementReactiveForms(newElement);
    } else {
      // Default is the one without validator.
      return new AsyncTableElementTemplateDriven(newElement);
    }
  }

  static isValidatorDefined(newElement: any) {
    return newElement.validator !== undefined && newElement.validator !== null;
  }
}
