var mkdirp = require('mkdirp');
['.log', 'lib'].forEach(function(dir) {
  mkdirp(dir);
});

var src = 'src/**/*.js';
var testSrc = 'test/unit/**/*.js';
var srcParts = ['src/', '**/*.js'];

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        sourceMaps: true,
        blacklist: [
          'es6.blockScoping',
          'es6.constants',
          'es6.classes',
          'regenerator',
          'es6.properties.shorthand',
          'es6.arrowFunctions',
          'es6.templateLiterals'
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: srcParts[0],
          src: [srcParts[1]],
          dest: 'lib/',
          ext: '.js'
        }]
      }
    },
    watch: {
      js: {
        files: src,
        tasks: ['babel']
      }
    },
    mochaTest: {
      main: {
        src: [testSrc],
        options: {
          quite: false,
          require: 'babel-register'
        }
      }
    },
    eslint: {
      target: [src, testSrc]
    },
    jshint: {
      all: [src, testSrc],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jscs: {
      src: [src, testSrc],
      options: {
        config: '.jscsrc'
      }
    }
  });
  grunt.registerTask('lint', ['jscs', 'jshint', 'eslint']);
};
