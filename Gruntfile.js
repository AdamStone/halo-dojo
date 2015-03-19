module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

//    frontend preprocessing

    copy: {
      html: {
        files: [{
          expand: true,
          src: ['**/*.html'],
          dest: 'frontend/public',
          cwd: 'frontend/src',
          flatten: true
        }]
      },
      images: {
        files: [{
          expand: true,
          cwd: 'frontend/src/images/',
          src: ['**/*.png', '**/*.jpg', '**/*.svg'],
          dest: 'frontend/public/images'
        }]
      }
    },

    sass: {
      build: {
        src: 'frontend/src/scss/styles.scss',
        dest: 'frontend/src/css/styles.css'
      }
    },

    cssmin: {
      build: {
        files: {
          'frontend/public/css/styles.min.css' : 'frontend/src/css/styles.css'
        }
      }
    },

    browserify: {
      build: {
        src: ['frontend/src/**/*.js',
              'frontend/src/**/*.jsx',
              '!frontend/src/**/__tests__/*.js',
              '!frontend/src/**/__tests__/*.jsx',
              '!frontend/src/**/__mocks__/*.js',
              '!frontend/src/**/__mocks__/*.jsx'],
        dest: 'frontend/public/bundle.js',
        options: {
          transform: [ require('grunt-react').browserify ]
        }
      }
    },

    watch: {
      options: {
//        livereload: true
        livereload: {
          port: 35729,
          key: grunt.file.read(
            './backend/app/gitignore.ssl/ssl-key.pem'),
          cert: grunt.file.read(
            './backend/app/gitignore.ssl/ssl-cert.pem')
        }
      },

      scss: {
        files: 'frontend/src/scss/*.scss',
        tasks: 'sass',
        options: {
          livereload: false
        }
      },

      css: {
        files: 'frontend/src/**/*.css',
        tasks: 'cssmin'
      },

      js: {
        files: ['frontend/src/**/*.js',
                'frontend/src/**/*.jsx',
                '!frontend/src/**/__tests__/*.js',
                '!frontend/src/**/__tests__/*.jsx',
                '!frontend/src/**/__mocks__/*.js',
                '!frontend/src/**/__mocks__/*.jsx'],
        tasks: 'browserify'
      },

      html: {
        files: ['frontend/src/**/*.html'],
        tasks: 'copy:html'
      },

      images: {
        files: ['frontend/src/images/**/*'],
        tasks: 'copy:images'
      },


      hapi: {
        files: [
          'backend/app/**/*.js',
          'backend/config/**/*.js',
          'shared/**/*.js',
          'Gruntfile.js'
        ],
        tasks: ['hapi'],
        options: {
          interrupt: true,
          spawn: false
        }
      }
    },

    hapi: {
      http: {
        options: {
          server: require('path').resolve('./backend/app/server'),
          livereload: 35729
        }
      }
    }

  });

  // batch load grunt-contrib-* modules
  var grunt_contribs = [
    'cssmin',
    'uglify',
    'watch',
    'copy'
  ];

  var grunts = [
    'hapi',
    'sass',
    'browserify'
  ];

  for (var i=0; i < grunt_contribs.length; i++) {
    grunt.loadNpmTasks('grunt-contrib-' + grunt_contribs[i]);
  }

  for (i=0; i < grunts.length; i++) {
    grunt.loadNpmTasks('grunt-' + grunts[i]);
  }

  grunt.registerTask('default', ['copy', 'sass', 'cssmin', 'browserify']);

  grunt.registerTask('serve', function() {
    grunt.task.run([
      'default',
      'hapi',
      'watch'
    ]);
  });
};
