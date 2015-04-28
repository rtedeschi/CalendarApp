function overlapDates(date1_1, date2_1, date1_2, date2_2) {
    if (!date1_1 && !date2_1 || !date1_2 && !date2_2) return true;
    if (!date1_2)
        return (date1_1 <= date2_2 || date2_1 <= date2_2);
    if (!date2_2) 
        return (date1_1 >= date1_2 || date2_1 >= date1_2);
    return (date1_1 >= date1_2 && date1_1 <= date2_2 || 
           date2_1 >= date1_2 && date2_1 <= date2_2 || 
           date1_2 >= date1_1 && date1_2 <= date2_1 || 
           date2_2 >= date1_1 && date2_2 <= date2_1);
};
angular.module('filters', [])
    .filter('proper', function () {
        return function (input) {
            return (input.substr(0, 1).toUpperCase() + input.substr(1));
        };
    })
    .filter('filterEvents', function () {
        return function (list, filter) {
            var returnList = [];
            if (!filter) filter = {};
            if (!filter.selected) filter.selected = {};
            if (!filter.filterValues) filter.filterValues = {};
            if (!filter.filterValues.title) filter.filterValues.title = '';
            if (filter.filterValues.endDate) {
                filter.filterValues.endDate.setHours(23)
                filter.filterValues.endDate.setMinutes(59);
            }
            for (var i = 0; i < list.length; i++) {
                if ((!filter.selected.type || filter.filterValues[list[i].type]) &&
                    (!filter.selected.title || filter.filterValues.title.length === 0 || list[i].title.toLowerCase().indexOf(filter.filterValues.title.toLowerCase()) >= 0) &&
                    (!filter.selected.date || overlapDates(list[i].starts_at, list[i].ends_at, filter.filterValues.startDate, filter.filterValues.endDate)))
                    returnList.push(list[i]);
            }
            return returnList;
        };
    });