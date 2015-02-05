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
    srcFiles: ['src/js/*.js'], // source files
    libDir: 'src/js/lib', // libraries that cannot be installed through bower
    componentsDir: 'src/js/components', // bower components
    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true, $: true, viewer: true, X: true
        }
      },
      source: {
        src: '<%= srcFiles %>'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      //test: {
      //  files: ['test/**/*.js']
      //}
    },
    jasmine: {
      src: '<%= jshint.source.src %>',
      options: {
        specs: 'test/**/*_spec.js',
        helpers: 'test/helpers/*.js'
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['<%= jshint.source.src %>', '<%= libDir %>/**/.js'], // no bower component is concatenated
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      html: {
        src: 'src/index.html',
        dest: 'dist/index.html',
      },
      styles: {
        files: [{expand: true, cwd: 'src/', src: ['styles/**'], dest: 'dist/'}]
      },
      config: {
        src: 'src/config_production.js',
        dest: 'dist/config.js',
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
    watch: {
      source: {
        files: '<%= jshint.source.src %>',
        tasks: ['jshint:source']
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      /*test: {
        files: '<%= jshint.test.files %>',
        tasks: ['jshint:test', 'jasmine']
      }*/
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Test task.
  // grunt.registerTask('test', ['jshint', 'jasmine']);
  grunt.registerTask('test', ['jshint']);
  // Build task.
  // grunt.registerTask('build', ['jshint', 'jasmine', 'concat', 'uglify', 'copy']);
  grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'copy']);
  // Default task.
  // grunt.registerTask('default', ['jshint', 'jasmine', 'concat', 'uglify', 'copy']);
  grunt.registerTask('default', ['build']);

};
