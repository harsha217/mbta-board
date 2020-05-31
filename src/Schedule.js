import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import {Table} from 'semantic-ui-react'

const TEXT_ON_TIME = 'ON TIME';
const TEXT_DELAYED = 'DELAYED';
const TEXT_ARRIVAL_TIME = 'Arrival Time';
const TEXT_DEPARTURE_TIME = 'Departure Time';
const TEXT_LINE    = 'Line';
const TEXT_DESTINATION = 'Destination';
const TEXT_STATUS = 'Status';
const TEXT_NO_DEPARTURES_MESSAGE = 'No Departures or Arrivals today :(';

const Schedule = ({currentStation}) => {
  const [stationSchedule, setStationSchedule] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    // Fetch Predictions and Schedule for all Commputer Trains at Current Station
    fetch(`/api/v1/get_predictions/${currentStation}`)
      .then(response => response.json())
      .then(response => {
      if (response.length === 0) {
        console.log('No Schedule/ Predictions for Current Station.'); 
        return;
      }  
      const formattedPredictionScheduleResponse = formatPredictionResponse(response);
      setStationSchedule(formattedPredictionScheduleResponse);
    })
    .catch(error => {
      // Can log this error to kibana for monitoring purposes. 
      console.log(error);
      setErrorMessage('Unable to load schedule for this station. Please try again later.');
    });
  }, [currentStation]);

  const formatPredictionResponse = (response) => {
    const predictions = response['data'];
    const additionalInfo = response['included'];
    const predictedSchedule = predictions.map(predictionData => {
      const filteredSchedule = additionalInfo.filter(data => data['id'] === predictionData['relationships']['schedule']['data']['id']); 
      if (!!predictionData['attributes']) { 
        predictionData['attributes']['departure_time'] = filteredSchedule[0]['attributes']['departure_time'] ? new Date(filteredSchedule[0]['attributes']['departure_time']).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}): 'Last Stop';
        predictionData['attributes']['arrival_time'] = filteredSchedule[0]['attributes']['arrival_time'] ? new Date(filteredSchedule[0]['attributes']['arrival_time']).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}): 'First Stop';  
      }
      const filteredRoute = additionalInfo.filter(data => data['id'] === predictionData['relationships']['route']['data']['id']);  
      const direction_id = filteredSchedule[0]['attributes']['direction_id'];
      predictionData['attributes']['destination'] = filteredRoute[0]['attributes']['direction_destinations'][direction_id];
      predictionData['attributes']['line'] = filteredRoute[0]['attributes']['long_name'];
      if (!!filteredSchedule[0]['attributes']['arrival_time']) {
        predictionData['attributes']['isOnTime'] = new Date() < new Date(filteredSchedule[0]['attributes']['arrival_time']) 
      } else if (!!filteredSchedule[0]['attributes']['departure_time']) {
        predictionData['attributes']['isOnTime'] = new Date() < new Date(filteredSchedule[0]['attributes']['departure_time']) 
      }
      predictionData['attributes']['color'] = filteredRoute[0]['attributes']['text_color'];
      return predictionData;
    });
    return predictedSchedule;
  }

  return (
    <Table celled selectable>
      <Table.Header>
        <Table.Row>
            <Table.HeaderCell textAlign="center" sorted="descending" width={3}>{TEXT_ARRIVAL_TIME}</Table.HeaderCell>
            <Table.HeaderCell textAlign="center" sorted="descending" width={3}>{TEXT_DEPARTURE_TIME}</Table.HeaderCell>
            <Table.HeaderCell textAlign="center" width={4}>{TEXT_LINE}</Table.HeaderCell>
            <Table.HeaderCell textAlign="center" width={4}>{TEXT_DESTINATION}</Table.HeaderCell>
            <Table.HeaderCell textAlign="center" width={3}>{TEXT_STATUS}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {stationSchedule && (
          stationSchedule.map(schedule => {
            return (
              <Table.Row key={schedule.attributes.id}>
                <Table.Cell textAlign="center">{schedule.attributes.arrival_time}</Table.Cell>
                <Table.Cell textAlign="center">{schedule.attributes.departure_time}</Table.Cell>
                <Table.Cell textAlign="center">{schedule.attributes.line}</Table.Cell>
                <Table.Cell textAlign="center">{schedule.attributes.destination}</Table.Cell>
                {schedule.attributes.isOnTime && (
                  <Table.Cell textAlign="center" positive>{TEXT_ON_TIME}</Table.Cell>
                )}
                {!schedule.attributes.isOnTime && (
                  <Table.Cell textAlign="center" negative>{TEXT_DELAYED}</Table.Cell>
                )}
              </Table.Row>
            );
          })
        )}
        {errorMessage}
        {stationSchedule.length === 0 && (
          <Table.Row>
            <Table.Cell singleLine textAlign="center">{TEXT_NO_DEPARTURES_MESSAGE}</Table.Cell>
          </Table.Row>   
        )}
      </Table.Body>
    </Table>
  );
}

Schedule.propTypes = {
    currentStation: propTypes.string.isRequired
};

export default Schedule;