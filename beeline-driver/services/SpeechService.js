import _ from 'lodash';

export default function($translate) {

  this.announcePassengerListDifferences = function (newStops, oldStops) {

    ((formatPassengerSummary(newStops[0]))).then(console.log)
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

    var text = (newServicedStops.length >= 1) ?
    [
      ['en-US', 'There are new passengers at the stop: '],
      ['en-US', newServicedStops.join(', and ')]
    ] : []

    speakMultilingual(text);
  }

  var lastGeoFence = null;

  this.announceGeoFence = function (stops, position) {
    if (!window.TTS) return;

    const {latitude, longitude} = position.coords;

    const distanceToStops = stops.map(stop =>
      distance(latitude, longitude, stop.stop.coordinates.coordinates[1], stop.stop.coordinates.coordinates[0])
    )

    const nearest = _.minBy(_.zip(distanceToStops, stops), ds => ds[0])

    if (nearest[0] < 150) { // Within geofence
      if (lastGeoFence !== nearest[1].id) {
        (async () => {
          speakMultilingual([
            ['en-US', `${nearest[1].stop.description}.`]
          ].concat(await formatPassengerSummary(nearest[1]))
          )
        })()
      }

      lastGeoFence = nearest[1].id;
    }
    else {
    }
  }
}

function formatPassengerSummary(tripStop) {
  // FIXME: need to separate passengerList by boarding/alighting passengers
  if (!tripStop.passengerList) {
    return '';
  }
  else if (tripStop.passengerList.length === 0) {
    return 'There are no passengers at this stop.';
  }
  else if (tripStop.passengerList.length === 1) {
    return 'There is one passenger at this stop.';
  }
  else {
    return `There are ${tripStop.passengerList.length} passengers at this stop.`
  }
}

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at http://www.geodatasource.com                          :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: http://www.geodatasource.com                        :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2015            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function distance(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
  // Convert from miles to metres
	dist = dist * 1.609344 * 1000;
	return dist
}
