export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundles/angular4-material-table.umd.js',
    format: 'umd',
    sourcemap: false,
    name: 'ng.angular4-material-table',
  },
  globals: {
    '@angular/core': 'ng.core',
    '@angular/forms': 'ng.forms',
    '@angular/common': 'ng.common',
    '@angular/cdk/collections': 'ng.cdk.collections',
    'rxjs/Observable': 'Rx',
    'rxjs/Subject': 'Rx',
    'rxjs/BehaviorSubject': 'Rx',
    'lodash.clonedeep':'index'
  }
}
