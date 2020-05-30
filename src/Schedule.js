import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import {Table} from 'semantic-ui-react'

const TEXT_ON_TIME = 'ON_TIME';
const TEXT_DELAYED = 'DELAYED';

// textAling=center constants from import.
const Schedule = ({currentStation}) => {
    const [stationSchedule, setStationSchedule] = useState([]);
    useEffect(() => {
            fetch(`/api/v1/getPredictions/${currentStation}`).then(response => response.json()).then(response => {
              if (response.length === 0) {
                 return;
              }  
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
              setStationSchedule(predictedSchedule);
            });
    }, [currentStation]);



    return (
        <Table celled selectable>
            <Table.Header>
            <Table.Row>
                <Table.HeaderCell textAlign="center" sorted="descending" width={3}>Arrival Time</Table.HeaderCell>
                <Table.HeaderCell textAlign="center" sorted="descending" width={3}>Departure Time</Table.HeaderCell>
                <Table.HeaderCell textAlign="center" width={4}>Line</Table.HeaderCell>
                <Table.HeaderCell textAlign="center" width={4}>Destination</Table.HeaderCell>
                <Table.HeaderCell textAlign="center" width={3}>Status</Table.HeaderCell>
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
                {stationSchedule.length === 0 && (
                    <Table.Row>
                        <Table.Cell singleLine textAlign="center"> No Departures or Arrivals today :( </Table.Cell>
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