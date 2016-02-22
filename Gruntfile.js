// Install grunt: http://gruntjs.com/getting-started
// npm install -g grunt-cli (to install grunt cli tool)
// npm install (to install all dependencies, including grunt)
// grunt test (to run test task)

/*global module, process, JSON */

module.exports = function (grunt) {
  /* jshint maxstatements: false */

  var open        = require('open'),
      Handlebars  = require('handlebars'),
      _           = require('lodash');

  var JS                    = 'target/js',
      JASMINE_TEST_FOLDER   = 'build2/reports/jasmine',
      JASMINE_TEST_FILE     = JASMINE_TEST_FOLDER + '/login.html',
      JSHINT_OUT_FILE       = 'build2/loginjs-checkstyle-result.xml',
      SPEC_HOME             = JS + '/test/spec/',
      DIST                  = 'dist',
      ASSETS                = 'assets/',
      SASS                  = ASSETS + 'sass',
      SCSSLINT_OUT_FILE     = 'build2/loginscss-checkstyle-result.xml',
      CSS                   = 'target/css',
      COPYRIGHT_TEXT        = grunt.file.read('src/widget/copyright.frag'),
      WIDGET_RC             = '.widgetrc',
      DEFAULT_SERVER_PORT   = 1804;

  var hasCheckStyle = process.argv.indexOf('--checkstyle') > -1;

  // .widgetrc is a json file that can be used by a dev to override
  // things like the widget options in the test server, the server port, etc
  var widgetRc = {};
  if (grunt.file.isFile(WIDGET_RC)) {
    widgetRc = grunt.file.readJSON(WIDGET_RC);
  }

  function getRequireOptions(options) {
    var requireOptions,
        startFiles = ['widget/copyright.frag'],
        includes = [
          // Note: BrowserFeatures must be loaded before xdomain, because
          // xdomain overwrites the XHR object. Any files that are used by
          // the wrapper files (i.e. OktaSigin.js) need to be included here
          // since they are not parsed for dependencies by require.
          'util/BrowserFeatures',
          'vendor/xdomain-0.7.3',
          'vendor/common-signin',
          'vendor/OktaAuth',
          'util/Util',
          'LoginRouter'
        ];
    if (options.includeJquery) {
      startFiles.push('widget/start.frag');
      includes.unshift('jquery');
    }
    else {
      startFiles.push('widget/start-no-jquery.frag');
      includes.unshift('widget/external-deps');
    }
    requireOptions = {
      baseUrl: '.',
      mainConfigFile: 'require.config.js',
      preserveLicenseComments: true,
      name: 'vendor/almond-0.3.1',
      optimize: options.uglify ? 'uglify2' : 'none',
      out: options.outFile,
      include: includes,
      wrap: {
        startFile: startFiles,
        endFile: [
          'require.config.js',
          'widget/OktaSignIn.js',
          'widget/end.frag'
        ]
      }
    };
    return requireOptions;
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    propertiesToJSON: {
      main: {
        src: ['resources/nls/*.properties'],
        dest: 'target/json/'
      }
    },

    JSONtoJs: {
      src: 'target/json',
      dest: 'target/js/nls/'
    },

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
        ],
        options: {
          process: function (content, srcpath) {
            if (srcpath.indexOf('copyright.frag') > 0) {
              return content;
            } else {
              return content.replace(COPYRIGHT_TEXT, '');
            }
          }
        }
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
      }
    },

    rename: {
      'js': {
        src: JS + '/okta-sign-in.js',
        dest: DIST + '/js/okta-sign-in-<%= pkg.version %>.min.js'
      },
      'js-no-jquery': {
        src: JS + '/okta-sign-in-no-jquery.js',
        dest: DIST + '/js/okta-sign-in-no-jquery-<%= pkg.version %>.js'
      },
      'css': {
        src: CSS + '/okta-sign-in.css',
        dest: DIST + '/css/okta-sign-in-<%= pkg.version %>.min.css'
      },
      'css-theme': {
        src: CSS + '/okta-theme.css',
        dest: DIST + '/css/okta-theme-<%= pkg.version %>.css'
      }
    },

    // Note: This is currently not being used. There is a bug in r.js which
    // causes this to fail when pulling in common-signin.js. When that bug
    // is resolved, we can switch back to using grunt-contrib-requirejs.
    // More info here:
    // https://github.com/jrburke/r.js/issues/880
    requirejs: {},

    // While we're waiting for requirejs to update with the fix, we instead
    // use our own r.js (buildtools/r.js) and execute it using the grunt-exec
    // plugin. We pass the build options through the json file generated
    // from these tasks.
    'json_generator': {
      'no-jquery': {
        dest: JS + '/build.js',
        options: getRequireOptions({
          includeJquery: false,
          uglify: false,
          outFile: 'okta-sign-in-no-jquery.js'
        })
      },
      dev: {
        dest: JS + '/build.js',
        options: getRequireOptions({
          includeJquery: true,
          uglify: false,
          outFile: 'okta-sign-in.js'
        })
      },
      prod: {
        dest: JS + '/build.js',
        options: getRequireOptions({
          includeJquery: true,
          uglify: true,
          outFile: 'okta-sign-in.js'
        })
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
      build: 'node buildtools/r.js -o target/js/build.js'
    },

    jasmine: {
      test: {
        options: {
          keepRunner: true,
          outfile: JASMINE_TEST_FILE,
          specs: [
            SPEC_HOME + '**/*_spec.js'
          ],
          junit: {
            path: JASMINE_TEST_FOLDER
          },
          display: grunt.option('display') || 'full',
          summary: true, // show stack traces and errors
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            requireConfigFile: JS + '/require.config.js',
            requireConfig: {
              // baseUrl is relative to build2/reports/jasmine/login.html
              baseUrl: '../../../' + JS,
              deps: ['jquery', 'jasmine-jquery', 'vendor/common-signin'],
              paths: {
                spec: 'test/spec',
                helpers: 'test/helpers',
                sandbox: 'test/helpers/sandbox',
                'jasmine-jquery': 'test/vendor/jasmine-jquery'
              },
              callback: function ($) {
                $(function () {
                  $('<div>').attr('id', 'sandbox').css({height: 1, overflow: 'hidden'}).appendTo('body');
                });
              }
            }
          }
        }
      },
      JSONtoJs: {
        options: {
          specs: [
            'buildtools/JSONtoJs/spec/*.js'
          ],
          template: require('grunt-template-jasmine-requirejs'),
          outfile: 'test/SpecRunner.html',
          keepRunner: true,
          summary: true
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
      }
    },

    'generate-latest-phone-codes': {
      options: {
        out: 'src/util/countryCallingCodes.js'
      }
    }

  });

  grunt.loadTasks('buildtools/JSONtoJs');
  grunt.loadTasks('buildtools/phonecodes');
  grunt.loadTasks('buildtools/scsslint');
  grunt.loadTasks('buildtools/bumpprereleaseversion');
  grunt.loadTasks('buildtools/shrinkwrap');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-json-generator');
  grunt.loadNpmTasks('grunt-rename');
  grunt.loadNpmTasks('grunt-properties-to-json');

  grunt.task.registerTask(
    'test',
    'Runs Jasmine Unit tests. If you are debugging in the browser with ' +
    '`grunt btest`, run `grunt test:build` to copy your changed files ' +
    'and refresh the browser',
    function (build) {
      grunt.task.run(['copy', 'propertiesToJSON', 'JSONtoJs', 'jasmine:test' + (build ? ':build' : ''),
       'jasmine:JSONtoJs']);
    }
  );

  grunt.task.registerTask('open-jasmine-specs-in-browser', 'Runs a File Tests on Browser', function () {
    open(JASMINE_TEST_FILE);
  });

  grunt.task.registerTask('btest', 'Runs Jasmine Unit Tests on Browser', function () {
    grunt.task.run(['test:build', 'open-jasmine-specs-in-browser']);
  });

  grunt.task.registerTask('prebuild', function (flag) {
    var tasks = ['copy:src', 'copy:assets-to-target', 'propertiesToJSON', 'JSONtoJs'];
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
      tasks.push('prebuild:minified', 'json_generator:prod');
    } else {
      tasks.push('prebuild', 'json_generator:dev');
    }
    tasks.push('exec');
    grunt.task.run(tasks);
  });

  grunt.task.registerTask(
    'package',
    'Generates versioned assets and copies them to the dist/ dir',
    [
      'prebuild:minified',
      'json_generator:prod', 'exec',
      'json_generator:no-jquery', 'exec',
      'rename', 'copy:assets-to-dist'
    ]
  );

  grunt.task.registerTask('start-server', ['copy:server', 'connect:server']);
  grunt.task.registerTask('start-server-open', ['copy:server', 'connect:open']);

  grunt.task.registerTask('lint', ['jshint', 'scss-lint']);

  grunt.task.registerTask('default', ['lint', 'test']);
};
