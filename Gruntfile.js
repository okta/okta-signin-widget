// Install grunt: http://gruntjs.com/getting-started
// npm install -g grunt-cli (to install grunt cli tool)
// npm install (to install all dependencies, including grunt)
// grunt test (to run test task)

/*global module, process */

module.exports = function (grunt) {
  /* jshint maxstatements: false */

  var open = require('open');

  var OKTA_HOME             = process.env.OKTA_HOME + '/okta-core/',
      JS                    = 'target/js',
      JASMINE_TEST_FOLDER   = 'build2/reports/jasmine',
      JASMINE_TEST_FILE     = JASMINE_TEST_FOLDER + '/login.html',
      JSHINT_OUT_FILE       = OKTA_HOME + 'build2/login_jshint_checkstyle.xml',
      SPEC_HOME             = JS + '/test/spec/',
      SDK                   = 'target/sdk',
      ASSETS                = 'assets/',
      SASS                  = ASSETS + 'sass',
      SCSSLINT_OUT_FILE     = OKTA_HOME + 'build2/login_scsslint.xml',
      CSS                   = 'target/css',
      COPYRIGHT_TEXT        = grunt.file.read('src/widget/copyright.frag');

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
        if (process.argv.indexOf('--checkstyle') > -1) {
          conf.reporter = 'checkstyle';
          conf.reporterOutput = JSHINT_OUT_FILE;
          conf.force = 'true';
        }
        return conf;
      }()),
      all: [
        'Gruntfile.js',
        'src/**/*.js',
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
      assets: {
        files: [
          {
            expand: true,
            cwd: 'assets/',
            src: ['font/**/*', 'img/**/*'],
            dest: 'target/'
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
      js: {
        src: JS + '/okta-sign-in.js',
        dest: SDK + '/okta-sign-in-<%= pkg.version %>.min.js'
      },
      css: {
        src: CSS + '/okta-sign-in.css',
        dest: SDK + '/okta-sign-in-<%= pkg.version %>.min.css'
      },
      theme: {
        src: CSS + '/okta-theme.css',
        dest: SDK + '/okta-theme-<%= pkg.version %>.css'
      }
    },

    // Note: This is currently not being used. There is a bug in r.js which
    // causes this to fail when pulling in common-signin.js. When that bug
    // is resolved, we can switch back to using grunt-contrib-requirejs.
    // More info here:
    // https://github.com/jrburke/r.js/issues/880
    requirejs: {
      // This is the version that we will use internally for the loginpage:
      // - Non-uglified (will happen later when we're building loginpage)
      // - Does not include jquery
      okta: {
        options: getRequireOptions({
          includeJquery: false,
          uglify: false,
          outFile: JS + '/login/okta-sign-in-no-jquery.js'
        })
      },
      // This generates the artifact that is used by widget consumers. In the
      // future, we'll probably publish several artifacts (i.e. one that
      // does not package jquery, etc)
      compile: {
        options: getRequireOptions({
          includeJquery: true,
          uglify: true,
          outFile: JS + '/login/okta-sign-in.js'
        })
      }
    },

    // While we're waiting for requirejs to update with the fix, we instead
    // use our own r.js (buildtools/r.js) and execute it using the grunt-exec
    // plugin. We pass the build options through the json file generated
    // from these tasks.
    'json_generator': {
      // This is the version that we will use internally for the loginpage:
      // - Non-uglified (will happen later when we're building loginpage)
      // - Does not include jquery
      okta: {
        dest: JS + '/build.js',
        options: getRequireOptions({
          includeJquery: false,
          uglify: false,
          outFile: 'okta-sign-in-no-jquery.js'
        })
      },
      // This generates the artifact that is used by widget consumers. In the
      // future, we'll probably publish several artifacts (i.e. one that
      // does not package jquery, etc)
      compile: {
        dest: JS + '/build.js',
        options: getRequireOptions({
          includeJquery: true,
          uglify: true,
          outFile: 'okta-sign-in.js'
        })
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
            path: OKTA_HOME + JASMINE_TEST_FOLDER,
            consolidate: true
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

    scsslint: {
      all: [SASS + '/**/*.scss'],
      options: (function () {
        var conf = {
          bundleExec: true,
          config: '.scss-lint.yml',
          reporterOutput: null,
          maxBuffer: 'Infinite'
        };
        if (process.argv.indexOf('--checkstyle') > -1) {
          conf.reporterOutput = SCSSLINT_OUT_FILE;
          conf.force = true;
        }
        return conf;
      }())
    },

    'generate-latest-phone-codes': {
      options: {
        out: 'src/util/countryCallingCodes.js'
      }
    }

  });

  grunt.loadTasks('buildtools/JSONtoJs');
  grunt.loadTasks('buildtools/phonecodes');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-scss-lint');
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

  // Used by pom.xml to build
  grunt.task.registerTask('build', function (flag) {
    var tasks = ['copy:src', 'copy:assets', 'propertiesToJSON', 'JSONtoJs'];
    if (flag === 'minified') {
      tasks.push('compass:minify');
    } else {
      tasks.push('compass:build');
    }
    tasks.push('compass:buildtheme', 'json_generator:okta', 'exec');
    grunt.task.run(tasks);
  });

  grunt.task.registerTask(
    'cut-new-version',
    'Temporary task to cut new version of the widget',
    ['copy:src', 'propertiesToJSON', 'JSONtoJs', 'compass:minify', 'compass:buildtheme',
     'json_generator:compile', 'exec', 'rename']
  );

  grunt.task.registerTask('lint', ['scsslint', 'jshint']);
  grunt.task.registerTask('default', ['lint', 'test']);
};
