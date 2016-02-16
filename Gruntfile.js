/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    // Custome Paths
    srcFiles: ['src/js/*.js'], // source files
    componentsDir: 'bower_components', // bower components
    testFiles: ['<%= componentsDir %>/viewerjs/spec/*.spec.js', 'spec/*.spec.js'], // test files (jasmine specs)

    // Task configuration.
    jscs: { // check javascript style
      options: {
        config: '.jscsrc',  // configuration file
        fix: true,
        force: true
      },
      source: {
        src: '<%= srcFiles %>'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      test: {
        src: '<%= testFiles %>'
      }
    },

    jshint: { // check javascript syntax and errors
      options: {
        jshintrc: true // configuration file
      },
      source: {
        src: '<%= jscs.source.src %>'
      },
      gruntfile: {
        src: '<%= jscs.gruntfile.src %>'
      },
      test: {
        src: '<%= jscs.test.src %>'
      }
    },

    connect: {
      test: {
        options: {
          port: 8001,
          base: [
            '.',
            'bower_components'
          ]
        }
      }
    },

    jasmine: { // run tests
      test: {
        // comment when using the define function within the specs files
        //src: '<%= jshint.source.src %>',
        options: {
          host: 'http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/',
          src: '<%= jshint.source.src %>',
          specs: '<%= jshint.test.src %>',
          template: require('grunt-template-jasmine-requirejs'),
          templateOptions: {
            version: '<%= componentsDir %>/requirejs/require.js',
            requireConfigFile: 'src/config.js', // requireJS's config file
            requireConfig: {
              baseUrl: '.' // change base url to execute tests from local FS
            }
          }
        }
      }
    },

    /* requirejs: { // concat and minimize AMD modules
       compile: {
         options: {
           baseUrl: '<%= componentsDir %>',
           paths: {
             jquery: 'empty:', // does not include jquery in the output
             jquery_ui: 'empty:', // does not include jquery_ui in the output
           },
           name: '<%= pkg.name %>',
           mainConfigFile: 'src/main.js',
           out: 'dist/js/<%= pkg.name %>.js'
         }
       }
     },
     */
    requirejs: { // concat and minimize AMD modules
      compile: {
        options: {
          baseUrl: 'dist/<%= pkg.name %>/src/js',
          paths: {
            jquery: 'empty:', // does not include jquery in the output
            jquery_ui: 'empty:', // does not include jquery_ui in the output
          },
          name: 'mi2b2',
          mainConfigFile: 'dist/<%= pkg.name %>/src/config.js',
          out: 'dist/gh-pages/js/<%= pkg.name %>.min.js',
          optimize: 'none',
          debug: true
        }
      }
    },

    cssmin: { // concat and minimize css
      dist: {
        files: {
          'dist/gh-pages/styles/<%= pkg.name %>.css': [
          '<%= componentsDir %>/rendererjs/src/styles/*.css',
          '<%= componentsDir %>/rboxjs/src/styles/*.css',
          '<%= componentsDir %>/thbarjs/src/styles/*.css',
          '<%= componentsDir %>/toolbarjs/src/styles/*.css',
          '<%= componentsDir %>/chatjs/src/styles/*.css',
          'src/styles/**/*.css']
        }
      }
    },

    uglify: { // minimize the main.js
      main: {
        files: {
          'dist/main.js': ['src/main.js']
        }
      }
    },

    processhtml: { // proccess index.html to remove <link> elements not required after building
      dist: {
        files: {
          'dist/gh-pages/index.html': ['src/index.html']
        }
      }
    },

    htmlmin: { // minify HTML
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/gh-pages/index.html': 'dist/gh-pages/index.html'
        }
      },
    },

    /*
        copy: {
          images: { // copy requiered images and icons
            files: [{expand: true, cwd: 'src/', src: ['images/**'], dest: 'dist/'}]
          },
          libs: { // copy requiered libs which were not concatenated

          },
          components: { // copy requiered bower components which were not concatenated
            files: [
              { expand: true,
                cwd: '<%= componentsDir %>',
                src: ['requirejs/require.js', 'jquery/dist/jquery.min.js',
                  'jquery-ui/jquery-ui.min.js', 'jquery-ui/themes/smoothness/**'],
                dest: 'dist/js/components' }]
          },
        },
        */
    copy: {
      images: { // copy requiered images and icons
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['images/**'],
            dest: 'dist/'
          }
        ]
      },
      components: {
        files: [
          {
            expand: true,
            cwd: '<%= componentsDir %>',
            src: ['**/*'],
            dest: 'dist/'
          },
          {
            expand: true,
            src: 'src/**/*',
            dest: 'dist/<%= pkg.name %>/'}]
      },
      config: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: 'config.build.js',
            dest: 'dist/gh-pages/',
            rename: function(dest) {
              return dest + 'main.js';
            }

          }
        ]
      },
      jquery: {
        files: [
          {expand: true,
            cwd: '<%= componentsDir %>',
            src: ['requirejs/require.js',
                  'jquery/dist/jquery.min.js',
                  'jquery-ui/jquery-ui.min.js',
                  'jquery-ui/themes/smoothness/**'],
            dest: 'dist/gh-pages/libs'}]
      }
    },

    watch: {
      source: {
        files: '<%= jshint.source.src %>',
        tasks: ['jshint:source']
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'jasmine']
      }
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
              'src/**/*.js',
              'src/**/*.css',
              'src/**/*.html'
          ]
        },
        options: {
          watchTask: true,
          // test to move bower_components out...
          // bower_components not used yet...
          server: ['src', 'bower_components'],
          startPath: ''
        }
      }
    },

    clean: {
      build: ['dist']
    }

  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-clean');
  // Serve task.
  grunt.registerTask('serve', function(/*target*/) {
    // grunt server:dist not implemented yet...

    // if (target === 'dist') {
    //   return grunt.task.run(['build', 'browserSync:dist',
    //   'watch']);
    // }

    grunt.task.run([
      'browserSync:dev',
      'watch'
    ]);
  });
  // Test task.
  grunt.registerTask('test', ['jshint', 'jasmine']);

  grunt.registerTask('yo', ['copy:components', 'connect', 'requirejs']);
  // Build task.
  grunt.registerTask('build', [
    'clean:build',
    'jscs', 'jshint',
    //'connect', 'jasmine',
    'processhtml',//'htmlmin',
    'cssmin',
    'copy:images', 'copy:components', 'copy:config', 'copy:jquery',
    'requirejs']);
  // Default task.
  grunt.registerTask('default', ['build']);
  /*
      // Build task.
    grunt.registerTask('build',
      ['cssmin', 'jscs', 'jshint', 'connect', 'jasmine', 'copy', 'requirejs']);

    grunt.registerTask('test', ['connect', 'jscs', 'jshint', 'jasmine']);
    // Build task.
    //grunt.registerTask('build', ['cssmin', 'test', 'requirejs', 'copy']);

    // Default task.
    grunt.registerTask('default',
      ['build']);*/

};
