import {TableElementReactiveForms} from './table-element-reactive-forms';
import {TableElementTemplateDriven} from './table-element-template-driven';
import {AsyncTableElementReactiveForms} from './async-table-element-reactive-forms';

export class TableElementFactory {

  public static createTableElement(newElement: any, async?: boolean): any {
    if (this.isValidatorDefined(newElement)) {
      if (async !== true) {
        // Create reactive forms element here.
        return new TableElementReactiveForms(newElement);
      }
      else {
        return new AsyncTableElementReactiveForms(newElement);
      }
    } else {
      // Default is the one without validator.
      return new TableElementTemplateDriven(newElement);
    }
  }

  static isValidatorDefined(newElement: any) {
    return newElement.validator !== undefined && newElement.validator !== null;
  }
}
