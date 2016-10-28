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
      SASS                  = 'target/sass',
      SCSSLINT_OUT_FILE     = 'build2/loginscss-checkstyle-result.xml',
      WIDGET_RC             = '.widgetrc',

      // Note: 3000 is necessary to test against certain browsers in SauceLabs
      DEFAULT_SERVER_PORT   = 3000;

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
        'test/**/*.js',
        '!test/unit/helpers/xhr/*.js',
        '!test/unit/vendor/**/*.js',
        '!src/vendor/*.js',
        '!src/util/countryCallingCodes.js'
      ]
    },

    copy: {
      'app-to-target': {
        files: [
          // Source Files
          {expand: true, cwd: 'src/', src: ['**'], dest: JS + '/'},

          // Courage files
          {expand: true, cwd: 'node_modules/@okta/courage/src/', src: ['**'], dest: JS + '/shared/'},
          {expand: true, cwd: 'node_modules/@okta/courage/src/vendor', src: ['**'], dest: JS + '/vendor/'},

          // i18n files
          {
            expand: true,
            cwd: 'node_modules/@okta/i18n/dist/',
            src: [
              'json/{login,country}*.json',
              'properties/{login,country}*.properties'
            ],
            dest: 'target/labels'
          },

          // Assets
          {
            expand: true,
            cwd: 'assets/',
            src: ['sass/**/*', 'font/**/*', 'img/**/*'],
            dest: 'target/'
          },

          // jquery.qtip.css -> _jquery.qtip.scss
          {
            expand: true,
            cwd: 'node_modules/qtip2/dist/',
            src: 'jquery.qtip.css',
            dest: 'target/sass/widgets',
            rename: function () {
              return 'target/sass/widgets/_jquery.qtip.scss';
            }
          }
        ]
      },

      'target-to-dist': {
        files: [
          {
            expand: true,
            cwd: 'target/',
            src: ['sass/**/*', 'font/**/*', 'img/**/*', 'labels/**/*'],
            dest: DIST
          },
          {
            expand: true,
            cwd: JS,
            src: ['okta-sign-in*'],
            dest: DIST + '/js'
          },
          {
            expand: true,
            cwd: 'target/css',
            src: ['*.css'],
            dest: DIST + '/css',
            rename: function (dest, src) {
              if (src === 'okta-sign-in.css') {
                return path.resolve(dest, 'okta-sign-in.min.css');
              }
              return path.resolve(dest, src);
            }
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
                  },
                  // Host the assets (i.e. jsonp files) locally
                  assets: {
                    baseUrl: '/'
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

      test: (function () {
        var src = ['assets/**/*', 'helpers/**/*', 'vendor/**/*', 'main.js'],
            spec = grunt.option('spec');

        if (spec) {
          // To run only one spec file, pass in the --spec option, i.e.
          // "grunt test --spec CryptoUtil_spec.js"
          src.push('spec/' + spec);
        }
        else {
          src.push('spec/**/*');
        }

        return {
          files: [
            {
              expand: true,
              cwd: 'test/unit/',
              src: src,
              dest: JS + '/test/unit/'
            }
          ]
        };
      }()),

      'e2e': {
        options: {
          process: function (content) {
            var browserName = grunt.option('browserName') || 'phantomjs',
                tpl = Handlebars.compile(content);
            return tpl({
              browserName: browserName,
              WIDGET_TEST_SERVER: process.env.WIDGET_TEST_SERVER,
              WIDGET_BASIC_USER: process.env.WIDGET_BASIC_USER,
              WIDGET_BASIC_PASSWORD: process.env.WIDGET_BASIC_PASSWORD,
              WIDGET_BASIC_USER_2: process.env.WIDGET_BASIC_USER_2,
              WIDGET_BASIC_PASSWORD_2: process.env.WIDGET_BASIC_PASSWORD_2,
              WIDGET_BASIC_USER_3: process.env.WIDGET_BASIC_USER_3,
              WIDGET_BASIC_PASSWORD_3: process.env.WIDGET_BASIC_PASSWORD_3,
              WIDGET_BASIC_USER_4: process.env.WIDGET_BASIC_USER_4,
              WIDGET_BASIC_PASSWORD_4: process.env.WIDGET_BASIC_PASSWORD_4,
              WIDGET_BASIC_USER_5: process.env.WIDGET_BASIC_USER_5,
              WIDGET_BASIC_PASSWORD_5: process.env.WIDGET_BASIC_PASSWORD_5,
              WIDGET_FB_USER: process.env.WIDGET_FB_USER,
              WIDGET_FB_PASSWORD: process.env.WIDGET_FB_PASSWORD,
              WIDGET_FB_USER_2: process.env.WIDGET_FB_USER_2,
              WIDGET_FB_PASSWORD_2: process.env.WIDGET_FB_PASSWORD_2,
              WIDGET_FB_USER_3: process.env.WIDGET_FB_USER_3,
              WIDGET_FB_PASSWORD_3: process.env.WIDGET_FB_PASSWORD_3,
              // To include accessibility check in the test, pass in -a11y option, i.e.
              // "grunt test-e2e --browserName chrome -a11y"
              CHECK_A11Y: !!grunt.option('a11y')
            });
          }
        },
        files: [
          {
            expand: true,
            cwd: 'test/e2e/',
            src: 'conf.js',
            dest: 'target/e2e/'
          },
          {
            expand: true,
            cwd: 'test/e2e/specs/',
            src: '*',
            dest: 'target/e2e/specs/'
          },
          {
            expand: true,
            cwd: 'test/e2e/util/',
            src: '*',
            dest: 'target/e2e/util/'
          },
          {
            expand: true,
            cwd: 'test/e2e/page-objects/',
            src: '*',
            dest: 'target/e2e/page-objects/'
          },
          {
            expand: true,
            cwd: 'test/e2e/app/',
            src: '*',
            dest: 'target/e2e/app/'
          }
        ]
      },

      'e2e-pages': {
        options: {
          process: function (content) {
            var cdnLayout = grunt.file.read('./test/e2e/layouts/cdn.tpl', {encoding: 'utf8'}),
                npmLayout = grunt.file.read('./test/e2e/layouts/npm.tpl', {encoding: 'utf8'}),
                testTpl = Handlebars.compile(content);
            Handlebars.registerPartial('cdnLayout', cdnLayout);
            Handlebars.registerPartial('npmLayout', npmLayout);
            return testTpl({
              WIDGET_TEST_SERVER: process.env.WIDGET_TEST_SERVER
            });
          }
        },
        files: [
          {
            expand: true,
            cwd: 'test/e2e/templates/',
            src: '*.tpl',
            dest: 'target/',
            rename: function(dest, src) {
              return dest + path.basename(src, '.tpl') + '.html';
            }
          }
        ]
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
      'clean': 'npm run clean',
      'build-dev': 'npm run build:webpack-dev',
      'build-release': 'npm run build:webpack-release',
      'build-test': 'npm run build:webpack-test',
      'build-e2e-app': 'npm run build:webpack-e2e-app',
      'run-protractor': 'npm run protractor'
    },

    jasmine: {
      test: {
        options: {
          keepRunner: true,
          outfile: JASMINE_TEST_FILE,
          specs: [
            'target/test/unit/main-tests.js'
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
        base: {
          path: 'target',
          options: {
            extensions: ['html']
          }
        },
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
      e2e: {
        options: {
          open: false,
          keepalive: false
        }
      }
    },

    'generate-config': {
      options: {
        languageGlob: 'target/labels/json/login_*.json',
        out: JS + '/config/config.json'
      }
    },

    'generate-latest-phone-codes': {
      options: {
        out: 'src/util/countryCallingCodes.js'
      }
    },

    'generate-jsonp': {
      target: {
        files: [
          {
            expand: true,
            cwd: 'target/labels/',
            src: 'json/{login,country}*.json',
            dest: 'target/labels'
          }
        ]
      }
    },

    retire: {
      js: ['src/**/*.js', 'test/**/*.js'],
      node: ['node_modules'],
      options: {
        packageOnly: false
      }
    }

  });

  grunt.loadTasks('buildtools/phonecodes');
  grunt.loadTasks('buildtools/scsslint');
  grunt.loadTasks('buildtools/generate-config');
  grunt.loadTasks('buildtools/generate-jsonp');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-json-generator');
  grunt.loadNpmTasks('grunt-retire');

  grunt.task.registerTask(
    'test-e2e',
    'Runs end to end webdriver tests. Pass in `--browserName {{browser}}` to ' +
    'override default phantomjs browser',
    function () {
      // We will only run webdriver tests in these two environments:
      // 1. Travis, non pull request builds
      // 2. Local, developer has set up an org to test against and has their
      //    credentials stored in the relevant ENV variables
      if (!process.env.WIDGET_TEST_SERVER) {
        grunt.log.writeln('Environment variables not available. Skipping.');
        return;
      }
      grunt.task.run([
        'build:release',
        'copy:e2e',
        'copy:e2e-pages',
        'exec:build-e2e-app',
        'connect:e2e',
        'exec:run-protractor'
      ]);
    }
  );

  grunt.task.registerTask(
    'test',
    'Runs Jasmine Unit tests. If you are debugging in the browser with ' +
    '`grunt btest`, run `grunt test:build` to copy your changed files ' +
    'and refresh the browser',
    function (build) {
      grunt.task.run([
        'exec:clean',
        'copy',
        'generate-config',
        'exec:build-test',
        'jasmine:test' + (build ? ':build' : '')
      ]);
    }
  );

  grunt.task.registerTask('open-jasmine-specs-in-browser', 'Runs a File Tests on Browser', function () {
    open(JASMINE_TEST_FILE);
  });

  grunt.task.registerTask('btest', 'Runs Jasmine Unit Tests on Browser', function () {
    grunt.task.run(['test:build', 'open-jasmine-specs-in-browser']);
  });

  grunt.task.registerTask('build', function (target) {
    var preBuildTasks = [],
        buildTasks = [],
        postBuildTasks = [];
    switch (target) {
    case 'release':
      preBuildTasks.push('retire');
      buildTasks.push('compass:minify', 'exec:build-release');
      postBuildTasks.push('copy:target-to-dist');
      break;
    case 'dev':
      buildTasks.push('compass:build', 'exec:build-dev');
      break;
    default:
      grunt.fail.fatal('Unknown target: ' + target);
      break;
    }
    grunt.task.run([].concat(
      preBuildTasks,
      [
        'exec:clean',
        'copy:app-to-target',
        'generate-config',
        'generate-jsonp:target',
        'compass:buildtheme'
      ],
      buildTasks,
      postBuildTasks
    ));
  });

  grunt.task.registerTask('start-server', ['copy:server', 'connect:server']);
  grunt.task.registerTask('start-server-open', ['copy:server', 'connect:open']);
  grunt.task.registerTask('lint', ['jshint', 'scss-lint']);
  grunt.task.registerTask('default', ['lint', 'test']);
};
