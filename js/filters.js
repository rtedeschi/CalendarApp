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
            filter = filter.filterValues;

            for (var i = 0; i < list.length; i++) {
                if (filter.type[list[i].type] && (filter.title.length === 0 || list[i].title.toLowerCase().indexOf(filter.title.toLowerCase()) >= 0) && overlapDates(list[i].starts_at, list[i].ends_at, filter.startDate, filter.endDate))
                    returnList.push(list[i]);
            }
            return returnList;
        };
    });