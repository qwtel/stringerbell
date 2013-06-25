// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'backbone', 'libs/backbone.localstorage'], function(_, Backbone, Store) {
    var TaskModel, _ref;
    TaskModel = (function(_super) {
      __extends(TaskModel, _super);

      function TaskModel() {
        _ref = TaskModel.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      TaskModel.prototype.url = '/task';

      TaskModel.prototype.defaults = function() {
        return {
          isBreak: null,
          date: null,
          startDate: null,
          text: '',
          edit: false
        };
      };

      TaskModel.prototype.validate = function(attrs, options) {
        if (attrs.text.length > 140) {
          return "can't end before it starts";
        }
      };

      TaskModel.prototype.localStorage = new Store('task');

      TaskModel.prototype.sync = sync;

      return TaskModel;

    })(Backbone.Model);
    return TaskModel;
  });

}).call(this);
