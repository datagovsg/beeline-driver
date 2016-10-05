import _ from 'lodash';

export default function() {

  this.announcePassengerListDifferences = function (newStops, oldStops) {

    if (!window.TTS) return;

    var oldStopsById = _.keyBy(oldStops, s => s.id)


    var newServicedStops = newStops.map(newStop => {
      if (!newStop.canBoard) return null;

      if (!(newStop.id in oldStopsById) ||
          _.get(newStop, 'passengerList.length') && !_.get(oldStopsById[newStop.id], 'passengerList.length')) {

          return newStop.stop.description;
      }
      else {
        return null;
      }
    }).filter(s => s)

    if (newServicedStops.length == 0) return;

    var text = (newServicedStops.length == 1) ?
    ('There are new passengers at the stop, ' + newServicedStops[0]) :
    ('There are new passengers at the stops, ' + newServicedStops.join(', and '));

    TTS.speak({text, locale: 'en-US', rate: 1}, console.log, console.log);

  }

}
