/* eslint max-statements: 0 no-console: 0 */

const ENV = require('@okta/env');
ENV.config();

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var Handlebars  = require('handlebars'),
      postcssAutoprefixer = require('autoprefixer')({remove: false}),
      cssnano     = require('cssnano')({safe: true}),      
      sass        = require('sass'),
      Fiber       = require('fibers'),
      path        = require('path');

  var JS                    = 'target/js',
      DIST                  = 'dist/dist',
      SASS                  = 'target/sass',
      I18N_SRC              = 'packages/@okta/i18n/src',
      // Note: 3000 is necessary to test against certain browsers in SauceLabs
      DEFAULT_SERVER_PORT   = 3000;

  var mockDuo = grunt.option('env.mockDuo');

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
            rename: function() {
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
            rename(dest, src) {
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
            src: ['okta-sign-in*', '!*.html', '!*.txt'],
            dest: DIST + '/js'
          },
          {
            expand: true,
            cwd: 'target/css',
            src: ['*.css', '*.css.map'],
            dest: DIST + '/css',
            rename: function(dest, src) {
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
          process: function(content) {
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
          process: function(content) {
            var cdnLayout = grunt.file.read('./test/e2e/layouts/cdn.tpl', {encoding: 'utf8'}),
                devLayout = grunt.file.read('./test/e2e/layouts/cdn-dev.tpl', {encoding: 'utf8'}),
                indexLayout = grunt.file.read('./test/e2e/layouts/index.tpl', {encoding: 'utf8'}),
                npmLayout = grunt.file.read('./test/e2e/layouts/npm.tpl', {encoding: 'utf8'}),
                sharedFunctions = grunt.file.read('./test/e2e/partials/shared-functions.js', {encoding: 'utf8'}),
                testTpl = Handlebars.compile(content),
                tplVars = {
                  GENERATES: 'This file is auto-generated. Do not edit.'
                };

            Object.assign(tplVars, ENV.getValues());

            Handlebars.registerPartial('cdnLayout', cdnLayout);
            Handlebars.registerPartial('devLayout', devLayout);
            Handlebars.registerPartial('indexLayout', indexLayout);
            Handlebars.registerPartial('npmLayout', npmLayout);
            Handlebars.registerPartial('sharedFunctions', sharedFunctions);
            return testTpl(tplVars);
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
          },
          // Copy okta-auth-js CDN bundle to target/js for use by oidc.tpl
          {
            expand: true,
            cwd: 'node_modules/@okta/okta-auth-js/dist',
            src: 'okta-auth-js.min.js*',
            dest: 'target/js'
          }
        ]
      }
    },

    exec: {
      'clean': 'yarn clean',
      'retirejs': 'yarn retirejs',
      'build-dev': 'yarn build:webpack-dev' + (mockDuo ? ' --env mockDuo=true' : ''),
      'build-dev-watch':
        'yarn build:webpack-dev --watch --env skipAnalyzer=true' + (mockDuo ? ' --env mockDuo=true' : ''),
      'build-release': 'yarn build:webpack-release',
      'build-e2e-app': 'yarn build:webpack-e2e-app',
      'generate-config': 'yarn generate-config',
      'run-protractor': 'yarn protractor',
      'pseudo-loc': 'node scripts/buildtools pseudo-loc',
      'prepack': 'node scripts/buildtools build:prepack'
    },

    sass: {
      options: {
        implementation: sass,
        fiber: Fiber,
        sourceMap: true,
        outputStyle: 'expanded',
        includePaths: [SASS]
      },
      build: {
        files: {
          [`${__dirname}/target/css/okta-sign-in.css`]: SASS + '/okta-sign-in.scss'
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
        port: DEFAULT_SERVER_PORT,
        base: {
          path: 'target',
          options: {
            extensions: ['html'],
            setHeaders: res => {
              res.setHeader(
                'Content-Security-Policy', 
                `script-src 'unsafe-inline' http://localhost:${DEFAULT_SERVER_PORT}`
              );
            }
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
    'build-e2e-app',
    'Builds the basic e2e test app.',
    function() {
      grunt.task.run([
        'copy:e2e',
        'copy:e2e-pages',
        'exec:build-e2e-app'
      ]);
    }
  );

  grunt.task.registerTask(
    'start-e2e-app',
    'Starts the basic e2e test app, without the test runner.',
    function() {
      grunt.task.run([
        'build-e2e-app',
        'connect:dev'
      ]);

    }
  );


  grunt.task.registerTask(
    'test-e2e',
    'Runs end to end webdriver tests. Pass in `--browserName {{browser}}` to ' +
    'override default phantomjs browser',
    function() {
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
        'build-e2e-app',
        'connect:e2e',
        'exec:run-protractor'
      ]);
    }
  );

  grunt.task.registerTask('assets', function(target) {
    const prodBuild = target === 'release';
    const buildTasks = [
      'copy:generate-in-translation',
      'propertiesToJSON',
      'copy:app-to-target',
      // 'exec:pseudo-loc', // TODO: Add after OKTA-379995 is completed
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

  grunt.task.registerTask('build', function(target, mode) {
    const prodBuild = target === 'release';
    const buildTasks = [];
    const postBuildTasks = [];

    if (prodBuild) {
      buildTasks.push('exec:build-release');
      postBuildTasks.push('copy:target-to-dist');
      postBuildTasks.push('exec:prepack');
    } else {
      const devTask = mode === 'watch' ? 'exec:build-dev-watch' : 'exec:build-dev';
      buildTasks.push(devTask);
    }
    grunt.task.run([
      'exec:clean',
      `assets:${target}`,
      ...buildTasks,
      'exec:retirejs',
      ...postBuildTasks,
    ]);
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
};
