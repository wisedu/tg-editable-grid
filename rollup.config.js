const babel = require('rollup-plugin-babel');
const rollup = require('rollup');
var uglify = require('rollup-plugin-uglify');
var path = require('path');
const cjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')


export default {
    input: 'src/main.js',
    output: {
      file: path.join("dist",'tg-editable-grid.js'),
      format: 'umd',
      sourcemap: true,
      name:"tg-editable-grid"
    },
    plugins: [
        node(),
        cjs(),
        babel(),
        uglify.uglify()
    ]
};