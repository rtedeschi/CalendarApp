'use strict';
/*
    newEvent() is called within angular-bootstrap-calendar-tpls.js on line 12,
    by the custom button at column 494.
*/
var newEvent = function (date) { }; // instantiated to insure no null function calls
angular
  .module('calendarApp', ['mwl.calendar', 'ui.bootstrap', 'ngRoute'])
  .config(function ($routeProvider) {
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
      .otherwise({ redirectTo: '/home' })
  })
  .controller('calendarController', function ($scope, $modal, moment) {

      var currentYear = moment().year();
      var currentMonth = moment().month();

      $scope.calendarView = 'month';
      $scope.calendarDay = new Date();
      var events = $scope.events = [];

      parseEvents();

      function parseEvents() {
          var store = localStorage.calendarString;
          if (store !== undefined) {
              var badData = false;
              var data = store.split('|');
              var numEvents = data.length;
              var event;
              for (var i = 0; i < numEvents; i++) {
                  try {
                      event = JSON.parse(data[i]);
                      event.starts_at = new Date(event.starts_at);
                      event.ends_at = new Date(event.ends_at);
                      event.eventNum = events.length;
                      events.push(event);
                  }
                  catch (exception) {
                      badData = true;
                  }
              }
              if (badData)
                  serializeEvents(); // stores a list of good events if any bad data was caught
          }
      };

      function serializeEvents() {
          var numEvents = events.length;
          var str = "";
          var temp;
          for (var i = 0; i < numEvents; i++) {
              temp = JSON.stringify(events[i]);
              temp = temp.substring(temp.indexOf('{'), temp.lastIndexOf('}') + 1);
              str += temp + (i < numEvents - 1 ? '|' : '');
          }
          localStorage.calendarString = str;
      };
      
      function showModal(action, event) {
          if (action === 'Clicked') {
              $modal.open({
                  templateUrl: 'viewEvent.html',
                  controller: function ($scope, $modalInstance) {
                      $scope.$modalInstance = $modalInstance;
                      $scope.action = action;
                      $scope.event = event;
                      $scope.eventEdited = eventEdited;
                      $scope.eventDeleted = eventDeleted;
                  }
              });
          }
          else if (action === 'Edited' || action === 'New') {
              $modal.open({
                  templateUrl: 'editEvent.html',
                  controller: function ($scope, $modalInstance) {
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
                          serializeEvents();
                      };
                  }
              });
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
                          serializeEvents();
                      };
                  }
              });
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

      var eventNew = newEvent = $scope.eventNew = function (date) {
          var event = {
              title: 'New Event',
              type: 'info',
              starts_at: (date === undefined ? $scope.calendarDay : date),
              ends_at: (date === undefined ? $scope.calendarDay : date),
              editable: true,
              deletable: true,
              incrementsBadgeTotal: true,
              eventNum: events.length
          };
          showModal('New', event);
      };

      $scope.temp = function (str, start, end) {
          if (start === undefined || start > str.length || start < 0)
              start = 0;
          if (end === undefined)
              end = start;
          else if (end === -1 || end > str.length)
              end = str.length;
          var temp = str.substring(0, start) + str.substring(start, end + 1).toUpperCase() + str.substr(end + 1);
          return temp;
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
              eventNum: event.eventNum
          };
          return newEvent;
      };

  })
  .controller('menuController', function ($scope, $modal, moment) {

  })
  .controller('mainController', function ($scope, $location) {
      $scope.routeTo = function (path) {
          $location.path(path);
      };
  });