/* global module, process */
/* eslint max-statements: 0 */
module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var Handlebars  = require('handlebars'),
      postcssAutoprefixer = require('autoprefixer')({remove: false}),
      cssnano     = require('cssnano')({safe: true}),
      nodesass = require('node-sass'),
      path        = require('path');

  var JS                    = 'target/js',
      DIST                  = 'dist',
      SASS                  = 'target/sass',
      SEARCH_OUT_FILE       = 'build2/OSW-search-checkstyle-result.xml',
      WIDGET_RC             = '.widgetrc',
      // Note: 3000 is necessary to test against certain browsers in SauceLabs
      DEFAULT_SERVER_PORT   = 3000;

  // .widgetrc is a json file that can be used by a dev to override
  // things like the widget options in the test server, the server port, etc
  var widgetRc = {};
  if (grunt.file.isFile(WIDGET_RC)) {
    widgetRc = grunt.file.readJSON(WIDGET_RC);
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      'app-to-target': {
        files: [
          // i18n files
          {
            expand: true,
            cwd: 'packages/@okta/i18n/dist/',
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
            cwd: 'packages/@okta/qtip2/dist/',
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
            src: ['okta-sign-in*', '!*.html'],
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
            cwd: 'test/e2e/appium',
            src: 'ios-conf.js',
            dest: 'target/e2e/appium'
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
                devLayout = grunt.file.read('./test/e2e/layouts/cdn-dev.tpl', {encoding: 'utf8'}),
                npmLayout = grunt.file.read('./test/e2e/layouts/npm.tpl', {encoding: 'utf8'}),
                testTpl = Handlebars.compile(content);
            Handlebars.registerPartial('cdnLayout', cdnLayout);
            Handlebars.registerPartial('devLayout', devLayout);
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
            rename: function (dest, src) {
              return dest + path.basename(src, '.tpl') + '.html';
            }
          }
        ]
      }
    },

    search: {
      noAbsoluteUrlsInCss: {
        files: {
          src: ['assets/sass/**/*.scss']
        },
        options: {
          searchString: /url\(['"]\//g,
          failOnMatch: true,
          logFile: SEARCH_OUT_FILE,
          logFormat: 'xml',
          onMatch: function (match) {
            grunt.log.errorlns('URLs starting with \'/\' are not allowed in SCSS files. ' +
              'Fix this by replacing with a relative link.');
            grunt.log.errorlns('Found in file: ' + match.file + '. Line: ' + match.line);
            grunt.log.errorlns('Error log also written to: ' + SEARCH_OUT_FILE);
            grunt.log.errorlns('');
          }
        }
      }
    },

    exec: {
      'clean': 'yarn clean',
      'retirejs': 'yarn retirejs',
      'build-dev': 'yarn build:webpack-dev',
      'build-release': 'yarn build:webpack-release',
      'build-e2e-app': 'yarn build:webpack-e2e-app',
      'generate-config': 'yarn generate-config',
      'generate-jsonp': 'yarn generate-jsonp',
      'run-protractor': 'yarn protractor'
    },

    sass: {
      options: {
        implementation: nodesass,
        sourceMap: true,
        outputStyle: 'expanded',
        includePaths: [SASS]
      },
      build: {
        files: {
          'target/css/okta-sign-in.css': SASS + '/okta-sign-in.scss'
        }
      }
    },
    postcss: {
      options: {
        diff: false,
        failOnError: true,
        map: true,
        processors: [
          postcssAutoprefixer
        ]
      },
      build: {
        src: 'target/css/okta-sign-in.css'
      },
      minify: {
        options: {
          processors: [
            postcssAutoprefixer,
            cssnano
          ]
        },
        src: 'target/css/okta-sign-in.css'
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
      e2e: {
        options: {
          open: false,
          keepalive: false
        }
      }
    },

  });

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
        'copy:e2e',
        'copy:e2e-pages',
        'exec:build-e2e-app',
        'connect:e2e',
        'exec:run-protractor'
      ]);
    }
  );

  grunt.task.registerTask('build', function (target) {
    const prodBuild = target === 'release';
    const buildTasks = [];
    const postBuildTasks = [];

    if (prodBuild) {
      buildTasks.push('postcss:minify', 'exec:build-release');
      postBuildTasks.push('copy:target-to-dist');
    } else {
      buildTasks.push('postcss:build', 'exec:build-dev');
    }
    grunt.task.run([
      'exec:clean',
      'exec:retirejs',
      'exec:generate-config',
      'copy:app-to-target',
      'exec:generate-jsonp',
      'sass:build',
      ...buildTasks,
      ...postBuildTasks,
    ]);
  });

  grunt.task.registerTask('lint', ['search:noAbsoluteUrlsInCss']);
};
