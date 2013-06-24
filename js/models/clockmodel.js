// Generated by CoffeeScript 1.6.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['underscore', 'backbone', 'collections/taskscollection', 'models/taskmodel', 'libs/backbone.localstorage'], function(_, Backbone, TasksCollection, TaskModel, Store) {
    var ClockModel, _ref;
    ClockModel = (function(_super) {
      __extends(ClockModel, _super);

      function ClockModel() {
        this.stopClock = __bind(this.stopClock, this);
        this.startClock = __bind(this.startClock, this);
        this.resetToFreetime = __bind(this.resetToFreetime, this);
        this.notifyUser = __bind(this.notifyUser, this);
        this.updateClock = __bind(this.updateClock, this);
        this.initialize = __bind(this.initialize, this);
        _ref = ClockModel.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ClockModel.prototype.defaults = {
        syncSecond: 0,
        syncMinute: 0,
        syncHour: 0,
        unsyncSecond: 0,
        unsyncMinute: 0,
        unsyncHour: 0,
        internalSecond: 0,
        internalMinute: 0,
        internalHour: 0,
        workTime: 18,
        freeTime: 2,
        isBreak: false,
        sound: true,
        soundBreak: true
      };

      ClockModel.prototype.initialize = function() {
        this.fetch();
        this.startClock();
        this.checkSupport();
        this.startDate = new Date().getTime();
        this.tasks = new TasksCollection;
        this.tasks.fetch();
        return this.tasks.sort();
      };

      ClockModel.prototype.updateClock = function() {
        var limit, syncHour, syncMinute, syncSecond, unsyncHour, unsyncMinute, unsyncSecond;
        syncSecond = this.get('syncSecond');
        syncMinute = this.get('syncMinute');
        syncHour = this.get('syncHour');
        unsyncSecond = this.get('unsyncSecond');
        unsyncMinute = this.get('unsyncMinute');
        unsyncHour = this.get('unsyncHour');
        syncSecond++;
        if (syncSecond >= 60) {
          syncMinute++;
          if (syncMinute >= 60) {
            syncHour++;
          }
        }
        unsyncSecond++;
        if (unsyncSecond >= 60) {
          unsyncMinute++;
          if (unsyncMinute >= 60) {
            unsyncHour++;
          }
        }
        this.sec++;
        if (this.sec >= 60) {
          this.sec = 0;
          this.min++;
          if (this.min >= 60) {
            this.hour++;
          }
        }
        this.set({
          'syncSecond': syncSecond % 60,
          'syncMinute': syncMinute % 60,
          'syncHour': syncHour % 12,
          'unsyncSecond': unsyncSecond % 60,
          'unsyncMinute': unsyncMinute % 60,
          'unsyncHour': unsyncHour % 12,
          'internalSecond': this.sec,
          'internalMinute': this.min,
          'internalHour': this.hour
        });
        limit = this.get('isBreak') ? this.get('freeTime') : this.get('workTime');
        if (this.min >= limit) {
          this.notifyUser();
          this.set({
            'isBreak': !this.get('isBreak')
          });
          return this.min = 0;
        }
      };

      ClockModel.prototype.notifyUser = function() {
        var notification, task;
        if (this.canShowNotifications) {
          if (window.webkitNotifications.checkPermission() === 0) {
            if (this.get('isBreak')) {
              notification = window.webkitNotifications.createNotification('/images/icon128.png', 'Your break is over!', '');
              if (this.get('soundBreak') && (this.canPlayMp3 || this.canPlayOgg)) {
                document.getElementById('bell').load();
                document.getElementById('bell').play();
              }
            } else {
              notification = window.webkitNotifications.createNotification('/images/icon128.png', 'Time to take a break!', '');
              if (this.get('sound') && (this.canPlayMp3 || this.canPlayOgg)) {
                document.getElementById('bell').load();
                document.getElementById('bell').play();
              }
              task = new TaskModel({
                isBreak: this.get('isBreak'),
                startDate: this.startDate,
                date: new Date().getTime(),
                edit: true
              });
              task.save();
              this.tasks.add(task);
            }
            this.startDate = new Date().getTime();
            notification.show();
            return setTimeout(function() {
              return notification.cancel();
            }, 10000);
          }
        }
      };

      ClockModel.prototype.checkSupport = function() {
        var myAudio;
        myAudio = document.createElement('audio');
        if (myAudio.canPlayType) {
          this.canPlayMp3 = !!myAudio.canPlayType && myAudio.canPlayType('audio/mpeg') !== '';
          this.canPlayOgg = !!myAudio.canPlayType && myAudio.canPlayType('audio/ogg; codecs="vorbis"') !== '';
        }
        return this.canShowNotifications = window.webkitNotifications;
      };

      ClockModel.prototype.setWorkTime = function(value) {
        if (this.get('isBreak') === false && this.min > value) {
          this["continue"]();
        }
        this.set({
          'workTime': value
        });
        return this.save();
      };

      ClockModel.prototype.setFreeTime = function(value) {
        if (this.get('isBreak') === true && this.min > value) {
          this["continue"]();
        }
        this.set({
          'freeTime': value
        });
        return this.save();
      };

      ClockModel.prototype["continue"] = function() {
        this.min = this.sec = this.hour = 0;
        return this.trigger('reset');
      };

      ClockModel.prototype.resetToWorktime = function() {
        this.stopClock();
        this.startClock();
        this.set({
          'isBreak': false
        });
        return this.trigger('change:isBreak');
      };

      ClockModel.prototype.resetToFreetime = function() {
        this.stopClock();
        this.startClock();
        this.set({
          'isBreak': true
        });
        return this.trigger('change:isBreak');
      };

      ClockModel.prototype.startClock = function() {
        var currentDate;
        this.sec = this.min = this.hour = 0;
        currentDate = new Date();
        this.set({
          'syncSecond': currentDate.getSeconds(),
          'syncMinute': currentDate.getMinutes(),
          'syncHour': currentDate.getHours() % 12,
          'unsyncSecond': this.sec,
          'unsyncMinute': this.min,
          'unsyncHour': this.hour,
          'internalSecond': this.sec,
          'internalMinute': this.min,
          'internalHour': this.hour,
          'isBreak': false
        });
        return this.interval = setInterval(this.updateClock, 1000);
      };

      ClockModel.prototype.stopClock = function() {
        if (this.interval != null) {
          return clearInterval(this.interval);
        }
      };

      ClockModel.prototype.tweet = function(text) {};

      ClockModel.prototype.localStorage = new Store('clock');

      ClockModel.prototype.sync = function(method, model, options) {
        var resp, store;
        store = this.localStorage;
        switch (method) {
          case 'create':
            resp = store.create(model);
            break;
          case 'read':
            resp = model.id != null ? store.find(model) : store.findAll();
            break;
          case 'update':
            resp = store.update(model);
            break;
          case 'delete':
            resp = store.destroy(model);
        }
        if (resp) {
          return options.success(resp);
        }
      };

      return ClockModel;

    })(Backbone.Model);
    return ClockModel;
  });

}).call(this);
