module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      'bundle.js': ['jumpJack.js']
    },
    watch: {
      files: ['jumpJack.js'],
      tasks: ['browserify']
   }
  });

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-watch');
};
