// Generated by CoffeeScript 1.6.3
(function() {
  require.config({
    paths: {
      jquery: 'lib/jquery-2.0.2',
      underscore: 'lib/underscore-1.4.4',
      backbone: 'lib/backbone-1.0.0',
      localstorage: "lib/backbone.localStorage",
      order: 'lib/order',
      text: 'lib/text',
      bootstrap: 'lib/bootstrap'
    },
    shim: {
      underscore: {
        exports: "_"
      },
      backbone: {
        deps: ["underscore", "jquery"],
        exports: "Backbone"
      }
    }
  });

  require(['jquery', 'models/clockmodel', 'views/clockview', 'views/settingsview', 'views/tasksview'], function($, ClockModel, ClockView, SettingsView, TasksView) {
    return $(document).ready(function() {
      var clockModel, clockView, settingsView, tasksView;
      clockModel = new ClockModel({
        id: 'clock'
      });
      clockView = new ClockView({
        el: $('#clock'),
        model: clockModel,
        scale: .8,
        sync: true
      });
      settingsView = new SettingsView({
        el: '#settings',
        model: clockModel
      });
      return tasksView = new TasksView({
        el: '#tasks',
        model: clockModel
      });
    });
  });

}).call(this);
