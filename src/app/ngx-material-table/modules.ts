export function isESModule<T>(value: any | T): value is { default: T } {
  return value && value['__esModule'] === true && !!value['default'];
}

/**
 * Workaround need for CommonJS library (eg. moment), because of packagr's issue - see https://github.com/ng-packagr/ng-packagr/issues/2215
 * @param commonJSModule
 */
export function unwrapESModule<T = any>(commonJSModule: T | any): T {
  return isESModule<T>(commonJSModule) ? commonJSModule.default : (commonJSModule as T);
}
