// Install grunt: http://gruntjs.com/getting-started
// npm install -g grunt-cli (to install grunt cli tool)
// npm install (to install all dependencies, including grunt)
// grunt test (to run test task)

/*global module, process, JSON */
module.exports = function (grunt) {
  /* jshint maxstatements: false */

  var open        = require('open'),
      Handlebars  = require('handlebars'),
      _           = require('underscore'),
      path        = require('path');

  var JS                    = 'target/js',
      JASMINE_TEST_FOLDER   = 'build2/reports/jasmine',
      JASMINE_TEST_FILE     = JASMINE_TEST_FOLDER + '/login.html',
      JSHINT_OUT_FILE       = 'build2/loginjs-checkstyle-result.xml',
      DIST                  = 'dist',
      ASSETS                = 'assets/',
      SASS                  = ASSETS + 'sass',
      SCSSLINT_OUT_FILE     = 'build2/loginscss-checkstyle-result.xml',
      CSS                   = 'target/css',
      WIDGET_RC             = '.widgetrc',
      DEFAULT_SERVER_PORT   = 1804;

  var hasCheckStyle = process.argv.indexOf('--checkstyle') > -1;

  // .widgetrc is a json file that can be used by a dev to override
  // things like the widget options in the test server, the server port, etc
  var widgetRc = {};
  if (grunt.file.isFile(WIDGET_RC)) {
    widgetRc = grunt.file.readJSON(WIDGET_RC);
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: (function () {
        var conf = {
          jshintrc: './.jshintrc'
        };
        if (hasCheckStyle) {
          conf.reporter = 'checkstyle';
          conf.reporterOutput = JSHINT_OUT_FILE;
          conf.force = true;
        }
        return conf;
      }()),
      all: [
        'Gruntfile.js',
        'src/**/*.js',
        'buildtools/**/*.js',
        '!buildtools/r.js',
        'test/helpers/**/*.js',
        'test/spec/**/*.js',
        '!test/helpers/xhr/*.js',
        '!src/vendor/*.js',
        '!src/util/countryCallingCodes.js'
      ]
    },

    copy: {
      src: {
        files: [
          {expand: true, cwd: 'src/', src: ['**'], dest: JS + '/'}
        ]
      },
      courage: {
        files: [
          {expand: true, cwd: 'node_modules/@okta/courage/src/', src: ['**'], dest: JS + '/shared/'},
          {expand: true, cwd: 'node_modules/@okta/courage/src/vendor', src: ['**'], dest: JS + '/vendor/'}
        ]
      },
      'i18n-to-dist': {
        files: [
          {
            expand: true,
            cwd: 'node_modules/@okta/i18n/dist/',
            src: [
              'json/{login,country}*.json',
              'properties/{login,country}*.properties'
            ],
            dest: DIST + '/labels'
          }
        ]
      },
      'assets-to-target': {
        files: [
          {
            expand: true,
            cwd: 'assets/',
            src: ['font/**/*', 'img/**/*'],
            dest: 'target/'
          }
        ]
      },
      'assets-to-dist': {
        files: [
          {
            expand: true,
            cwd: 'assets/',
            src: ['sass/**/*', 'font/**/*', 'img/**/*'],
            dest: DIST
          }
        ]
      },
      server: {
        options: {
          process: function (content) {
            var template = Handlebars.compile(content),
                options = _.extend({
                  baseUrl: 'http://rain.okta1.com:1802',
                  logo: '/img/logo_widgico.png',
                  features: {
                    router: true,
                    rememberMe: true,
                    multiOptionalFactorEnroll: true
                  }
                }, widgetRc.widgetOptions);
            return template({ options: JSON.stringify(options) });
          }
        },
        files: [
          {
            expand: true,
            cwd: 'buildtools/templates/',
            src: 'index.tpl',
            dest: 'target/',
            rename: function () {
              return 'target/index.html';
            }
          }
        ]
      },
      test: {
        files: [
          {expand: true, src: ['test/**'], dest: JS + '/'}
        ]
      },
      'protractor-conf': {
        files: [
          {
            expand: true,
            cwd: 'test/protractor/',
            src: 'conf.js',
            dest: 'target/protractor/'
          }
        ]
      },
      'protractor-specs': {
        options: {
          process: function (content) {
            var specTemplate = Handlebars.compile(content);
            return specTemplate({
              WIDGET_BASIC_PASSWORD: JSON.stringify(process.env.WIDGET_BASIC_PASSWORD)
            });
          }
        },
        files: [
          {
            expand: true,
            cwd: 'test/protractor/specs/',
            src: '*',
            dest: 'target/protractor/specs/'
          }
        ]
      },
      'protractor-pages': {
        options: {
          process: function (content) {
            var harnessTemplateString = grunt.file.read('./test/protractor/harness.tpl', {
              encoding: 'utf8'
            });
            var harnessTemplate = Handlebars.compile(harnessTemplateString);
            var testTemplate = Handlebars.compile(content);
            return harnessTemplate({testCode: testTemplate({
              WIDGET_TEST_SERVER: JSON.stringify(process.env.WIDGET_TEST_SERVER)
            })});
          }
        },
        files: [
          {
            expand: true,
            cwd: 'test/protractor/templates/',
            src: '*.tpl',
            dest: 'target/protractor/pages/',
            rename: function(dest, src) {
              return dest + path.basename(src, '.tpl') + '.html';
            }
          }
        ]
      }
    },

    rename: {
      'js': {
        src: JS + '/okta-sign-in.js',
        dest: DIST + '/js/okta-sign-in.min.js'
      },
      'js-no-jquery': {
        src: JS + '/okta-sign-in-no-jquery.js',
        dest: DIST + '/js/okta-sign-in-no-jquery.js'
      },
      'css': {
        src: CSS + '/okta-sign-in.css',
        dest: DIST + '/css/okta-sign-in.min.css'
      },
      'css-theme': {
        src: CSS + '/okta-theme.css',
        dest: DIST + '/css/okta-theme.css'
      }
    },

    'scss-lint': {
      all: {
        options: (function () {
          if (hasCheckStyle) {
            return {
              force: true,
              reporter: 'checkstyle',
              reporterOutput: SCSSLINT_OUT_FILE
            };
          }
          else {
            return {
              force: false
            };
          }
        }())
      }
    },

    exec: {
      'build-dev': 'npm run build:webpack-dev',
      'build-prod': 'npm run build:webpack-prod',
      'build-no-jquery': 'npm run build:webpack-no-jquery',
      'build-test': 'npm run build:test',
      'run-protractor': 'npm run protractor'
    },

    jasmine: {
      test: {
        options: {
          keepRunner: true,
          outfile: JASMINE_TEST_FILE,
          specs: [
            'target/test/main-tests.js'
          ],
          junit: {
            path: JASMINE_TEST_FOLDER
          },
          display: grunt.option('display') || 'full',
          summary: true // show stack traces and errors
        }
      }
    },

    compass: {
      options: {
        cssDir: 'target/css',
        sassDir: SASS,
        httpImagesPath: '/',
        httpGeneratedImagesPath: '/',
        bundleExec: true,
        boring: true,
        noLineComments: true
      },
      build: {
        options: {
          specify: SASS + '/okta-sign-in.scss',
          sourcemap: true,
          force: grunt.option('force') || false
        }
      },
      buildtheme: {
        options: {
          specify: SASS + '/okta-theme.scss',
          sourcemap: true,
          force: true
        }
      },
      minify: {
        options: {
          specify: SASS + '/okta-sign-in.scss',
          force: true,
          environment: 'production'
        }
      },
      watch: {
        options: {
          watch: true
        }
      }
    },

    connect: {
      options: {
        port: (function () {
          return widgetRc.serverPort || DEFAULT_SERVER_PORT;
        }()),
        base: 'target',
        keepalive: true
      },
      server: {
        options: {
          open: false
        }
      },
      open: {
        options: {
          open: true
        }
      },
      protractor: {
        options: {
          open: false,
          keepalive: false
        }
      }
    },

    'generate-latest-phone-codes': {
      options: {
        out: 'src/util/countryCallingCodes.js'
      }
    },

    retire: {
      js: [
        'src/**/*.js',
        'test/**/*.js'
      ],
      node: ['node_modules'],
      options: {
        packageOnly: false
      }
    }

  });

  grunt.loadTasks('buildtools/phonecodes');
  grunt.loadTasks('buildtools/scsslint');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-json-generator');
  grunt.loadNpmTasks('grunt-rename');
  grunt.loadNpmTasks('grunt-retire');

  grunt.task.registerTask(
    'test',
    'Runs Jasmine Unit tests. If you are debugging in the browser with ' +
    '`grunt btest`, run `grunt test:build` to copy your changed files ' +
    'and refresh the browser',
    function (build) {
      grunt.task.run(['copy', 'exec:build-test', 'jasmine:test' + (build ? ':build' : '')]);
    }
  );

  grunt.task.registerTask('open-jasmine-specs-in-browser', 'Runs a File Tests on Browser', function () {
    open(JASMINE_TEST_FILE);
  });

  grunt.task.registerTask('btest', 'Runs Jasmine Unit Tests on Browser', function () {
    grunt.task.run(['test:build', 'open-jasmine-specs-in-browser']);
  });

  grunt.task.registerTask('prebuild', function (flag) {
    var tasks = ['retire', 'copy:src', 'copy:assets-to-target', 'copy:courage'];
    if (flag === 'minified') {
      tasks.push('compass:minify');
    } else {
      tasks.push('compass:build');
    }
    tasks.push('compass:buildtheme');
    grunt.task.run(tasks);
  });

  grunt.task.registerTask('build', function (flag) {
    var tasks = [];
    if (flag === 'minified') {
      tasks.push('prebuild:minified', 'exec:build-prod');
    } else {
      tasks.push('prebuild', 'exec:build-dev');
    }
    grunt.task.run(tasks);
  });

  grunt.task.registerTask(
    'prep-release',
    'Generates dist/ directory with publish assets',
    [
      'prebuild:minified',
      'exec:build-prod',
      'exec:build-no-jquery',
      'rename:js',
      'rename:js-no-jquery',
      'rename:css',
      'rename:css-theme',
      'copy:assets-to-dist',
      'copy:i18n-to-dist'
    ]
  );

  grunt.task.registerTask('start-server', ['copy:server', 'connect:server']);
  grunt.task.registerTask('start-server-open', ['copy:server', 'connect:open']);
  grunt.task.registerTask('test-protractor', [
    'copy:protractor-conf',
    'copy:protractor-specs',
    'copy:protractor-pages',
    'build',
    'connect:protractor',
    'exec:run-protractor'
  ]);

  grunt.task.registerTask('lint', ['jshint', 'scss-lint']);

  grunt.task.registerTask('default', ['lint', 'test']);
};
