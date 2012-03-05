(function() {

  define([], function() {
    var Angle;
    Angle = (function() {

      function Angle(rad) {
        this.rad = rad;
      }

      Angle.initRadians = function(rad) {
        return new Angle(rad);
      };

      Angle.initDegrees = function(deg) {
        return new Angle(deg * Math.PI / 180);
      };

      Angle.initSeconds = function(sec) {
        return new Angle(sec * Math.PI / 30);
      };

      Angle.initMinutes = function(min) {
        return this.initSeconds(min);
      };

      Angle.initHours = function(hour) {
        return new Angle(hour * Math.PI / 6);
      };

      Angle.prototype.getRadians = function() {
        return this.rad;
      };

      Angle.prototype.getDegrees = function() {
        return this.rad / (Math.PI / 180);
      };

      Angle.prototype.toString = function() {
        return this.getDegrees() + 'deg';
      };

      Angle.prototype.add = function(other) {
        return new Angle(this.rad + other.rad);
      };

      Angle.prototype.compareTo = function(other) {
        return this.rad - other.rad;
      };

      return Angle;

    })();
    return Angle;
  });

}).call(this);
