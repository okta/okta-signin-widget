/* global module, process */
/* eslint max-statements: 0 no-console: 0 */

var ENV = require('./test/e2e/env');
ENV.config();

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
      I18N_SRC              = 'packages/@okta/i18n/src',
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
            cwd: I18N_SRC,
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

      'generate-in-translation': {
        files: [
          {
            expand: true,
            cwd: I18N_SRC,
            src: [
              'properties/{login,country}_id.properties'
            ],
            dest: I18N_SRC,
            rename (dest, src) {
              var targetFile = `${dest}/${src.replace('_id', '_in')}`;
              grunt.log.write(`Generates _in properties: ${dest}/${src} to ${targetFile} \n`);
              return targetFile;
            },
          },
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
                tpl = Handlebars.compile(content),
                tplVars = {
                  browserName: browserName,

                  // To include accessibility check in the test, pass in -a11y option, i.e.
                  // "grunt test-e2e --browserName chrome -a11y"
                  CHECK_A11Y: !!grunt.option('a11y')
                };

            Object.assign(tplVars, ENV.getValues());
            return tpl(tplVars);
          }
        },
        files: [
          {
            expand: true,
            cwd: 'test/e2e/',
            src: '*.js',
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
            cwd: 'test/e2e/appium',
            src: 'android-conf.js',
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
                indexLayout = grunt.file.read('./test/e2e/layouts/index.tpl', {encoding: 'utf8'}),
                npmLayout = grunt.file.read('./test/e2e/layouts/npm.tpl', {encoding: 'utf8'}),
                testTpl = Handlebars.compile(content),
                tplVars = {};

            Object.assign(tplVars, ENV.getValues());

            Handlebars.registerPartial('cdnLayout', cdnLayout);
            Handlebars.registerPartial('devLayout', devLayout);
            Handlebars.registerPartial('indexLayout', indexLayout);
            Handlebars.registerPartial('npmLayout', npmLayout);

            return testTpl(tplVars);
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
      'build-dev-watch': 'yarn build:webpack-dev --watch --env.skipAnalyzer',
      'build-release': 'yarn build:webpack-release',
      'build-e2e-app': 'yarn build:webpack-e2e-app',
      'generate-config': 'yarn generate-config',
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
      },
      dev: {
        options: {
          open: true
        }
      }
    },

    propertiesToJSON: {
      main: {
        src: [`${I18N_SRC}/properties/*.properties`],
        dest: `${I18N_SRC}/json`
      }
    },

    watch: {
      sass: {
        files: ['assets/sass/**/*'],
        tasks: [
          'copy:app-to-target', 
          'sass:build', 
          'postcss:build'
        ]
      }
    },

  });

  grunt.task.registerTask(
    'test-e2e',
    'Runs end to end webdriver tests. Pass in `--browserName {{browser}}` to ' +
    'override default phantomjs browser',
    function () {
      // Print warnings for missing environment variables
      ENV.checkValues();

      // We will only run webdriver tests in these two environments:
      // 1. Travis, non pull request builds
      // 2. Local, developer has set up an org to test against and has their
      //    credentials stored in the relevant ENV variables
      if (!process.env.WIDGET_TEST_SERVER) {
        grunt.log.writeln('Environment variables not available. Skipping.');
        return;
      }

      grunt.log.writeln('Testing against: ' + process.env.WIDGET_TEST_SERVER);

      grunt.task.run([
        'copy:e2e',
        'copy:e2e-pages',
        'exec:build-e2e-app',
        'connect:e2e',
        'exec:run-protractor'
      ]);
    }
  );

  grunt.task.registerTask('assets', function (target) {
    const prodBuild = target === 'release';
    const buildTasks = [
      'copy:generate-in-translation',
      'propertiesToJSON',
      'copy:app-to-target',
      'exec:generate-config', // populates src/config.json with supported languages
      'sass:build',
    ];

    if (prodBuild) {
      buildTasks.push('postcss:minify');
    } else {
      buildTasks.push('postcss:build');
    }

    grunt.task.run(buildTasks);
  });

  grunt.task.registerTask('build', function (target, mode) {
    const prodBuild = target === 'release';
    const buildTasks = [];
    const postBuildTasks = [];

    if (prodBuild) {
      buildTasks.push('exec:build-release');
      postBuildTasks.push('copy:target-to-dist');
    } else {
      const devTask = mode === 'watch' ? 'exec:build-dev-watch' : 'exec:build-dev';
      buildTasks.push(devTask);
    }
    grunt.task.run([
      'exec:clean',
      'exec:retirejs',
      `assets:${target}`,
      ...buildTasks,
      ...postBuildTasks,
    ]);
  });

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.task.registerTask('lint', ['search:noAbsoluteUrlsInCss']);
};
