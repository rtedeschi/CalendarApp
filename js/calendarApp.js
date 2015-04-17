'use strict';

angular
  .module('calendarApp', ['mwl.calendar', 'ui.bootstrap'])
  .controller('calendarController', function ($scope, $modal, moment) {

      var currentYear = moment().year();
      var currentMonth = moment().month();

      //These variables MUST be set as a minimum for the calendar to work
      $scope.calendarView = 'month';
      $scope.calendarDay = new Date();
      var events = $scope.events = [
        {
              title: 'Event 1',
              type: 'warning',
              starts_at: new Date(currentYear, currentMonth, 25, 8, 30),
              ends_at: new Date(currentYear, currentMonth, 25, 9, 30),
              editable: true,
              deletable: true,
              incrementsBadgeTotal: true,
              eventNum: 0
        }
      ];

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

      var eventNew = $scope.eventNew = function () {
          var event = {
              title: 'New Event',
              type: 'info',
              starts_at: new Date(),
              ends_at: new Date(),
              editable: true,
              deletable: true,
              incrementsBadgeTotal: true,
              eventNum: events.length
          };
          showModal('New', event);
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

  });