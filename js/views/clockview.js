(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['jquery', 'jquerymobile', 'underscore', 'backbone', 'misc/angle', 'text!templates/clock.html'], function($, $mobile, _, Backbone, Angle, clockTemplate) {
    var ClockView;
    ClockView = (function(_super) {

      __extends(ClockView, _super);

      function ClockView(params) {
        this.rotateHand = __bind(this.rotateHand, this);
        this.rotateHands = __bind(this.rotateHands, this);
        this.drawSlice = __bind(this.drawSlice, this);
        this.calculateSize = __bind(this.calculateSize, this);
        this.draw = __bind(this.draw, this);
        this.resize = __bind(this.resize, this);
        this.render = __bind(this.render, this);
        this.redraw = __bind(this.redraw, this);
        this.calculateCurrentAngle = __bind(this.calculateCurrentAngle, this);        this.scale = params.scale || 1;
        this.sync = params.sync != null ? params.sync : false;
        this.workColor = '#8ac3e9';
        this.freeColor = '#6496b4';
        ClockView.__super__.constructor.call(this, params);
      }

      ClockView.prototype.initialize = function() {
        this.resize = _.throttle(this.resize, 50);
        $(window).bind('resize', this.resize);
        this.model.bind('change:syncSecond', this.rotateHands);
        this.model.bind('change:workTime', this.draw);
        this.model.bind('change:freeTime', this.draw);
        this.model.bind('change:isBreak', this.redraw);
        this.model.bind('reset', this.redraw);
        this.initialAngle = this.calculateCurrentAngle();
        this.render();
        this.$secondHand = this.$('.second-hand').first();
        this.$minuteHand = this.$('.minute-hand').first();
        this.$hourHand = this.$('.hour-hand').first();
        return this.rotateHands();
      };

      ClockView.prototype.calculateCurrentAngle = function() {
        var currentAngle, minute, second;
        currentAngle = Angle.initRadians(1.5 * Math.PI);
        if (this.sync) {
          second = this.model.get('syncSecond');
          minute = this.model.get('syncMinute');
        } else {
          second = this.model.get('unsyncSecond');
          minute = this.model.get('unsyncMinute');
        }
        return currentAngle.add(Angle.initMinutes(minute + second / 60));
      };

      ClockView.prototype.redraw = function() {
        this.initialAngle = this.calculateCurrentAngle();
        return this.draw();
      };

      ClockView.prototype.template = _.template(clockTemplate);

      ClockView.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this.resize();
      };

      ClockView.prototype.resize = function() {
        var fontSize, size;
        this.size = size = this.calculateSize(this.scale);
        this.$el.width(size).height(size);
        this.$('.hand').height(size);
        this.$('.slices').first().attr({
          'width': size,
          'height': size
        });
        fontSize = Math.round(size * .1);
        this.$('.number').css({
          fontSize: fontSize,
          marginTop: -(fontSize / 2)
        });
        fontSize = Math.round(size * .08);
        this.$('.clock-name').css({
          fontSize: fontSize
        });
        fontSize = Math.round(size * .019);
        this.$('.tag-line, .by').css({
          fontSize: fontSize
        });
        return this.draw();
      };

      ClockView.prototype.draw = function() {
        var c, canvas, slice, slices, _i, _len, _results;
        slices = this.composeSlices();
        canvas = this.$('.slices').first();
        c = canvas[0].getContext('2d');
        c.clearRect(0, 0, this.size, this.size);
        _results = [];
        for (_i = 0, _len = slices.length; _i < _len; _i++) {
          slice = slices[_i];
          _results.push(this.drawSlice(c, slice));
        }
        return _results;
      };

      ClockView.prototype.composeSlices = function() {
        var alternate, completeCircle, endAngle, freeTime, i, n, offsetAngle, radius, size, slices, sumTime, t, workTime, _ref;
        slices = [];
        workTime = this.model.get('workTime');
        freeTime = this.model.get('freeTime');
        size = this.size;
        n = 0;
        sumTime = 0;
        alternate = this.model.get('isBreak');
        while (sumTime < 60) {
          if (alternate) {
            sumTime += freeTime;
            n++;
          } else {
            sumTime += workTime;
            n++;
          }
          alternate = !alternate;
        }
        offsetAngle = Angle.initRadians(this.initialAngle.getRadians());
        radius = size / 2;
        alternate = this.model.get('isBreak');
        for (i = 0, _ref = n - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
          t = alternate ? freeTime : workTime;
          endAngle = offsetAngle.add(Angle.initSeconds(t));
          completeCircle = this.initialAngle.add(Angle.initDegrees(360));
          if (endAngle.compareTo(completeCircle) > 0) endAngle = completeCircle;
          slices.push({
            radius: radius,
            startAngle: offsetAngle,
            endAngle: endAngle,
            isBreak: alternate
          });
          radius *= 0.68;
          offsetAngle = endAngle;
          alternate = !alternate;
        }
        return slices;
      };

      ClockView.prototype.calculateSize = function(scale) {
        var height, size, width;
        width = $('.c50').width();
        height = $(window).height();
        size = width <= height ? width : height;
        size = Math.floor(size * scale);
        return size;
      };

      ClockView.prototype.drawSlice = function(c, slice) {
        var color, endAngle, radius, size, sliceGradient, startAngle, startX, startY;
        size = this.size;
        startX = size / 2;
        startY = size / 2;
        radius = slice.radius;
        startAngle = slice.startAngle.getRadians();
        endAngle = slice.endAngle.getRadians();
        color = slice.isBreak ? this.freeColor : this.workColor;
        sliceGradient = c.createLinearGradient(0, 0, size / 2, size / 2);
        sliceGradient.addColorStop(0, '#eee');
        sliceGradient.addColorStop(1, color);
        c.beginPath();
        c.moveTo(startX, startY);
        c.arc(startX, startY, radius, startAngle, endAngle, false);
        c.lineTo(startX, startY);
        c.closePath();
        c.fillStyle = sliceGradient;
        return c.fill();
      };

      ClockView.prototype.rotateHands = function() {
        var hour, hourAngle, minute, minuteAngle, second, secondAngle;
        if (this.sync) {
          second = this.model.get('syncSecond');
          minute = this.model.get('syncMinute');
          hour = this.model.get('syncHour');
        } else {
          second = this.model.get('unsyncSecond');
          minute = this.model.get('unsyncMinute');
          hour = this.model.get('unsyncHour');
        }
        secondAngle = Angle.initSeconds(second);
        minuteAngle = Angle.initMinutes(minute + second / 60);
        hourAngle = Angle.initHours(hour + minute / 60 + second / 3600);
        this.rotateHand(this.$secondHand, secondAngle);
        this.rotateHand(this.$minuteHand, minuteAngle);
        return this.rotateHand(this.$hourHand, hourAngle);
      };

      ClockView.prototype.rotateHand = function($hand, angle) {
        return $hand.css({
          '-moz-transform': "rotate(" + angle + ")",
          '-webkit-transform': "rotate(" + angle + ")",
          '-o-transform': "rotate(" + angle + ")",
          '-ms-transform': "rotate(" + angle + ")",
          '-transform': "rotate(" + angle + ")"
        });
      };

      return ClockView;

    })(Backbone.View);
    return ClockView;
  });

}).call(this);
