'use strict';
/*
    newEvent() and dayEvents() are called within angular-bootstrap-calendar-tpls.js
*/
var newEvent = function (date) { }; // instantiated to insure no null function calls
var dayEvents = function (events, date) { };
var modalOpen = false;

/*
    Toast!
*/
var toast = function (message, title, type) {
    if (!type) type = 'success';
    if (!title) title = '';
    toastr[type](message, title);
};
toastr.options.positionClass = 'toast-bottom-right';

angular
  .module('calendarApp', ['mwl.calendar', 'ui.bootstrap', 'ngRoute', 'filters'])

  .config(function ($routeProvider, $compileProvider) {
      $routeProvider.when('/home',
      {
          controller: 'menuController',
          templateUrl: 'views/home.html'
      })
      .when('/calendar',
      {
          controller: 'calendarController',
          templateUrl: 'views/calendar.html'
      })
      .otherwise({ redirectTo: '/home' });
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/); // Fix for cordova builds
  })

  .controller('calendarController', function ($scope, $modal, moment, $filter) {
      modalOpen = $scope.modalOpen = false;
      $scope.eventTypes = ['important', 'warning', 'info', 'success', 'inverse', 'special'];
      var currentYear = moment().year();
      var currentMonth = moment().month();

      $scope.calendarView = 'month';
      $scope.calendarDay = new Date();
      var events = $scope.events = [];
      $scope.filteredEvents = [];
      $scope.filter = {};

      $scope.resetFilter = function () {
          $scope.filter = {
              selected: undefined,
              filterValues: {
                  title: "",
                  type: {
                      important: true,
                      warning: true,
                      info: true,
                      success: true,
                      inverse: true,
                      special: true
                  },
                  endDate: undefined,
                  startDate: undefined
              }
          };
      };
      $scope.resetFilter();

      $scope.eventsFilter = function () {
          $scope.filteredEvents = $filter('filterEvents')(events, $scope.filter);
      };

      parseEvents();

      function parseEvents() {
          var store = localStorage.calendarString;
          if (store !== undefined) {
              var badData = false;
              var data = store.split('|');
              // Decrypt sensitive local data
              var numEvents = data.length;
              var event;
              for (var i = 0; i < numEvents; i++) {
                  try {
                      event = JSON.parse(data[i]);
                      event.starts_at = new Date(event.starts_at);
                      event.ends_at = new Date(event.ends_at);
                      event.eventNum = events.length;
                      cleanEvent(event);
                      events.push(event);
                  }
                  catch (exception) {
                      badData = true; // if there is a parsing error, ignore the corrupted event
                  }
              }
              if (badData)
                  serializeEvents(); // stores a list of good events if any bad data was caught
          }
          $scope.eventsFilter();
      };

      function serializeEvents() {
          var numEvents = events.length;
          var str = "";
          var temp;
          for (var i = 0; i < numEvents; i++) {
              temp = JSON.stringify(events[i]);
              str += temp + (i < numEvents - 1 ? '|' : '');
          }
          // Encrypt to secure sensitive local data
          $scope.eventsFilter();
          localStorage.calendarString = str;
      };

      function forLoop(min, ceil, step) {
          if (!step) step = 1;
          var ret = [];
          for (var i = min; i < ceil; i += step)
              ret.push(i);
          return ret;
      }
      
      dayEvents = $scope.enumerateEvents = function (events, date, activeCount) {
          modalOpen = true;
          $modal.open({
              templateUrl: 'enumEvents.html',
              controller: function ($scope, $modalInstance) {
                  if (activeCount === undefined) activeCount = events.length;
                  $scope.$modalInstance = $modalInstance;
                  $scope.events = events;
                  $scope.date = date;
                  $scope.eventEdited = eventEdited;
                  $scope.eventDeleted = eventDeleted;
                  $scope.eventClicked = eventClicked;
                  $scope.activeCount = activeCount;
                  $scope.datesEqual = function (date1, date2) {
                      return (date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate());
                  };
                  $scope.newEvent = function (date) {
                      newEvent(date);
                  }
              }
          }).result.then(
              function (newModal) { modalOpen = newModal; },
              function () { modalOpen = false; }
              );
      };

      function showModal(action, event) {
          if (action === 'Clicked') {
              modalOpen = true;
              $modal.open({
                  templateUrl: 'viewEvent.html',
                  controller: function ($scope, $modalInstance) {
                      $scope.$modalInstance = $modalInstance;
                      $scope.action = action;
                      $scope.event = event;
                      $scope.eventEdited = eventEdited;
                      $scope.eventDeleted = eventDeleted;
                  }
              }).result.then(
                  function (newModal) { modalOpen = newModal; },
                  function () { modalOpen = false; }
                  );
          }
          else if (action === 'Edited' || action === 'New') {
              modalOpen = true;
              $modal.open({
                  templateUrl: 'editEvent.html',
                  controller: function ($scope, $modalInstance) {
                      var startDate = event.starts_at;
                      var endDate = event.ends_at;
                      $scope.icons_row1 = ['exclamation-sign', 'warning-sign', 'ok-sign', 'info-sign', 'remove-sign']; // signs
                      $scope.icons_row2 = ['list', 'star', 'asterisk', 'check', 'bell']; // general icons
                      $scope.icons_row3 = ['cog', 'time', 'flash', 'record', 'dashboard']; // more general icons
                      $scope.icons_row4 = ['road', 'shopping-cart', 'briefcase', 'blackboard', 'piggy-bank']; // locations
                      $scope.$modalInstance = $modalInstance;
                      $scope.action = action;
                      /*
                        creates a copy of the event if it already exists so that
                        the event isn't changed unless the user confirms
                      */
                      $scope.event = (action === 'Edited' ? copyEvent(event) : event);
                      $scope.updateEvent = function (event) {
                          if (event.eventNum === events.length)
                              events.push(event);
                          else
                              events[event.eventNum] = event;
                          toast('\'' + event.title + '\' saved successfully!');
                          serializeEvents();
                      };

                      $scope.startToday = function () {
                          var today = new Date();
                          today.setHours(event.starts_at.getHours());
                          today.setMinutes(event.starts_at.getMinutes());
                          today.setMilliseconds(0);
                          event.starts_at = today;
                      };
                      $scope.endToday = function () {
                          var today = new Date();
                          today.setHours(event.ends_at.getHours());
                          today.setMinutes(event.ends_at.getMinutes());
                          today.setMilliseconds(0);
                          event.ends_at = today;
                      };

                      $scope.update = function () {
                          if ($scope.event.allDay) {
                              startDate = new Date(event.starts_at);
                              endDate = new Date(event.ends_at);
                              var start = new Date(event.starts_at);
                              var end = new Date(event.starts_at);
                              start.setHours(12);
                              end.setHours(12);
                              end.setMinutes(0);
                              start.setMinutes(0);
                              $scope.event.starts_at = start;
                              $scope.event.ends_at = end;
                          } else {
                              $scope.event.starts_at = startDate;
                              $scope.event.ends_at = endDate;
                          }
                      };
                      $scope.update();
                  }
              }).result.then(
                  function () { modalOpen = false; },
                  function () { modalOpen = false; }
                  );
          }
          else if (action === 'Deleted') {
              $modal.open({
                  templateUrl: 'killEvent.html',
                  controller: function ($scope, $modalInstance) {
                      $scope.$modalInstance = $modalInstance;
                      $scope.action = action;
                      $scope.event = event;
                      $scope.kill = function (event) {
                          events.splice(event.eventNum, 1);
                          for (var i = event.eventNum; i < events.length; i++)
                              events[i].eventNum--;
                          toast('\'' + event.title + '\' deleted successfully!', '', 'warning');
                          serializeEvents();
                      };
                  }
              }).result.then(
                  function () { modalOpen = false; },
                  function () { modalOpen = false; }
                  );
          }
      }

      var eventClicked = $scope.eventClicked = function (event) {
          showModal('Clicked', event);
      };

      var eventEdited = $scope.eventEdited = function (event) {
          showModal('Edited', event);
      };

      var eventDeleted = $scope.eventDeleted = function (event) {
          showModal('Deleted', event);
      };

      newEvent = $scope.eventNew = function (date) {
          var event = {
              title: 'New Event',
              type: 'info',
              starts_at: (date === undefined ? $scope.calendarDay : date),
              ends_at: (date === undefined ? $scope.calendarDay : date),
              editable: true,
              deletable: true,
              incrementsBadgeTotal: true,
              eventNum: events.length,
              allDay: false,
              icon: 'none',
              descript: ''
          };
          showModal('New', event);
      };

      function cleanEvent(event, index) {
          // ensures all event properties are set
          if (!event.title) event.title = 'Event ' + (index + 1);
          if (!event.type) event.type = 'info';
          if (!event.starts_at) event.starts_at = new Date();
          if (!event.ends_at) event.ends_at = new Date();
          if (!event.editable) event.editable = true;
          if (!event.deletable) event.deletable = true;
          if (!event.incrementsBadgeTotal) event.incrementsBadgeTotal = true;
          if (!event.eventNum) event.eventNum = index;
          if (!event.allDay) event.allDay = false;
          if (!event.icon) event.icon = 'none';
          if (!event.descript) event.descript = '';
      };

      $scope.setCalendarToToday = function () {
          $scope.calendarDay = new Date();
      };

      $scope.toggle = function ($event, field, event) {
          $event.preventDefault();
          $event.stopPropagation();

          event[field] = !event[field];
      };

      function copyEvent(event) {
          var newEvent = {
              title: event.title,
              type: event.type,
              starts_at: event.starts_at,
              ends_at: event.ends_at,
              editable: event.editable,
              deletable: event.deletable,
              incrementsBadgeTotal: event.incrementsBadgeTotal,
              eventNum: event.eventNum,
              allDay: event.allDay,
              icon: event.icon,
              descript: event.descript
          };
          return newEvent;
      };

      $scope.filterStartToday = function () {
          var today = new Date();
          today.setHours(0);
          today.setMinutes(0);
          today.setMilliseconds(0);
          $scope.filter.filterValues.startDate = today;
      };
      $scope.filterEndToday = function () {
          var today = new Date();
          today.setHours(23);
          today.setMinutes(59);
          today.setMilliseconds(0);
          $scope.filter.filterValues.endDate = today;
      };

  })

  .controller('menuController', function ($scope, $modal, moment) {

  })

  .controller('mainController', function ($scope, $location) {
      $scope.routeTo = function (path) {
          $location.path(path);
      };
      $scope.toast = toast;
  })
    
  .controller('datepicker', function ($scope) {

      $scope.open = function ($event) {
          $event.preventDefault();
          $event.stopPropagation();

          $scope.opened = true;
      };

      $scope.format = 'fullDate';
  });