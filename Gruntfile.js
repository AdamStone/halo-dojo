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
        src: 'frontend/src/scss/main.scss',
        dest: 'frontend/src/css/styles.css'
      }
    },

    cssmin: {
      build: {
        src: 'frontend/src/css/styles.css',
        dest: 'frontend/public/css/styles.min.css'
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

    uglify: {
      build: {
        src: 'frontend/public/bundle.js',
        dest: 'frontend/public/bundle.min.js'
      }
    },

    watch: {
      options: {
        livereload: {
          port: 35730,
          key: grunt.file.read(
            './backend/app/gitignore.ssl/localhost-ssl-key.pem'),
          cert: grunt.file.read(
            './backend/app/gitignore.ssl/localhost-ssl-cert.pem')
        }
      },

      scss: {
        files: 'frontend/src/scss/**/*.scss',
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
          livereload: 35730
        }
      }
    }

  });

  // batch load grunt-contrib-* modules
  var gruntContribs = [
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

  for (var i=0; i < gruntContribs.length; i++) {
    grunt.loadNpmTasks('grunt-contrib-' + gruntContribs[i]);
  }

  for (i=0; i < grunts.length; i++) {
    grunt.loadNpmTasks('grunt-' + grunts[i]);
  }

  grunt.registerTask('default', [
    'copy',
    'sass',
    'cssmin',
    'browserify',
    'uglify'
  ]);

  grunt.registerTask('serve', function() {
    grunt.task.run([
      'default',
      'hapi',
      'watch'
    ]);
  });
};
