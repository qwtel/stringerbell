# @fileOverview A simple alarm clock (bell) that tells you when it's time to 
# take a break.
# @author <a href="https://www.twitter.com/cell303">@cell303</a>
# @version 1

define [
  'underscore'
  'backbone'
  'collections/taskscollection'
  'models/taskmodel'
  'localstorage'
], (_, Backbone, TasksCollection, TaskModel) ->

  # Implements the logic of a stop watch.
  class ClockModel extends Backbone.Model

    url: '/clock'

    # These default values should match those in the template.
    defaults:
      canShowNotifications: false
      syncSecond: 0
      syncMinute: 0
      syncHour: 0
      unsyncSecond: 0
      unsyncMinute: 0
      unsyncHour: 0
      internalSecond: 0
      internalMinute: 0
      internalHour: 0
      workTime: 18
      freeTime: 2
      isBreak: false
      sound: true
      tag: null

    # Sets initial values and starts the interval.
    initialize: =>
      @fetch()
      @startClock()
      @checkSupport()

      @tasks = new TasksCollection
      @tasks.fetch()
      @tasks.sort()

    # Updates the values of the clock.
    # This function has to be called every 1 sec.
    # When the limit for the current period is reached it will notify the user.
    updateClock: =>
      syncSecond = @get('syncSecond')
      syncMinute = @get('syncMinute')
      syncHour = @get('syncHour')
      unsyncSecond = @get('unsyncSecond')
      unsyncMinute = @get('unsyncMinute')
      unsyncHour = @get('unsyncHour')
      
      syncSecond++
      if syncSecond >= 60
        syncMinute++
        if syncMinute >= 60
          syncHour++

      unsyncSecond++
      if unsyncSecond >= 60
        unsyncMinute++
        if unsyncMinute >= 60
          unsyncHour++

      @sec++
      if @sec >= 60
        @sec = 0
        @min++
        if @min >= 60
          @hour++

      @set(
        'syncSecond': syncSecond % 60
        'syncMinute': syncMinute % 60
        'syncHour': syncHour % 12
        'unsyncSecond': unsyncSecond % 60
        'unsyncMinute': unsyncMinute % 60
        'unsyncHour': unsyncHour % 12
        'internalSecond': @sec
        'internalMinute': @min
        'internalHour': @hour
      )
      
      limit = if @get('isBreak') then @get('freeTime') else @get('workTime')

      if @min >= limit
        @notifyUser()
        @set('isBreak': !@get('isBreak'))
        @min = 0


    # Notifies the user that a time slice has been completed.
    # Currently only chrome/html5 notifications are supproted.
    notifyUser: =>
      @newTask()

      if @get('sound') and (@canPlayMp3 or @canPlayOgg)
        document.getElementById('bell').load()
        document.getElementById('bell').play()

      if @get('canShowNotifications')
        if window.webkitNotifications.checkPermission() is 0

          if @get('isBreak')
            notification = window.webkitNotifications.createNotification '/images/icon128.png', 'Your break is over!', ''
          else
            notification = window.webkitNotifications.createNotification '/images/icon128.png', 'Time to take a break!', ''

          notification.show()
          setTimeout ->
            notification.cancel()
          , 10000

    newTask: ->
      date = new Date().getTime()
      time = Math.round((date - @startDate)/60000)
      task = new TaskModel 
        isBreak: @get "isBreak"
        startDate: @startDate
        date: date
        time: time

      task.save()
      @tasks.add task

      @startDate = new Date().getTime()

    # Checks if the browser supports html5 stuff...
    checkSupport: ->
      myAudio = document.createElement('audio')
      if (myAudio.canPlayType)
        #Currently canPlayType(type) returns: "", "maybe" or "probably" 
        @canPlayMp3 = !!myAudio.canPlayType and myAudio.canPlayType('audio/mpeg') isnt ''
        @canPlayOgg = !!myAudio.canPlayType and myAudio.canPlayType('audio/ogg; codecs="vorbis"') isnt ''

      @set 'canShowNotifications', (window.webkitNotifications)

    # Will reset the clock if the new value is smaller then 
    # the time that already passed in the current time slice.
    # @param {number} value The new value.
    setWorkTime: (value) ->
      if @get('isBreak') is false and @min > value
        @continue()
      @set('workTime': value)
      @save()

    # Will reset the clock if the new value is smaller then 
    # the time that already passed in the current time slice.
    # @param {number} value The new value.
    setFreeTime: (value) ->
      if @get('isBreak') is true and @min > value
        @continue()
      @set('freeTime': value)
      @save()

    # Resets the clock.
    # Also toggles the mode to cause a redraw of the slices.
    continue: () ->
      @min = @sec = @hour = 0
      @trigger('reset')

    # Resets the clock by clearing the interval and begins with a new 
    # work timeslice.
    resetToWorktime: () ->
      @stopClock()
      @startClock()
      @set('isBreak': false)
      @trigger('change:isBreak')

    # Resets the clock by clearing the interval and begins with a new 
    # break timeslice.
    resetToFreetime: =>
      @stopClock()
      @startClock()
      @set('isBreak': true)
      @trigger('change:isBreak')

    # Start the clock by assigning default values and then setting the interval.
    startClock: =>
      currentDate = new Date()
      @startDate = currentDate.getTime()
      @sec = @min = @hour = 0

      @set
        syncSecond: currentDate.getSeconds()
        syncMinute: currentDate.getMinutes()
        syncHour: currentDate.getHours() % 12
        unsyncSecond: @sec
        unsyncMinute: @min
        unsyncHour: @hour
        internalSecond: @sec
        internalMinute: @min
        internalHour: @hour
        isBreak: false

      @interval = setInterval(@updateClock, 1000)

    # Pauses the clock by clearing the interval.
    stopClock: =>
      if @interval? then clearInterval(@interval)

    localStorage: new Backbone.LocalStorage 'clock'
  
  return ClockModel
