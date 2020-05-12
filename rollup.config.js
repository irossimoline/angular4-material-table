import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'dist/index.js',
  output: {
    format: 'umd',
    sourcemap: true,
    file: 'dist/bundles/angular4-material-table.umd.js',
    name: 'ng.angular4-material-table',
  },
  plugins: [
    resolve({
      mainFields: ['jsnext', 'main'],
      customResolveOptions: {
        moduleDirectory: 'node_modules'
      }
    }),
    commonjs()
  ],
  external: [
    '@angular/core',
    '@angular/common',
    '@angular/forms',
    '@angular/cdk/collections',
    'rxjs/Observable',
    'rxjs/Subject',
    'rxjs/BehaviorSubject',
    'lodash.clonedeep',
    'tslib'
  ]
}
