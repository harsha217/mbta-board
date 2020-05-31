import React, {useEffect, useState} from 'react';
import {Dropdown, Container, Menu, Header, Card, Divider} from 'semantic-ui-react';
import Clock from 'react-live-clock';
import Schedule from './Schedule';
import './DepartureBoard.css';

const COMMUTER_RAIL_ROUTE_TYPE_ID = 2;
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TEXT_HOME = 'Home';
const TEXT_SCHEDULE = 'SCHEDULE';
const TEXT_CHOOSE_STATION = 'Choose Station';
const TEXT_STATION_NAME = 'Station Name';

const DepartureBoard = () => {
  const [allStations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const today = new Date();
  useEffect(() => {
    // Fetch all Stops specific to Commuter Routes.
    fetch(`/api/v1/get_stops/${COMMUTER_RAIL_ROUTE_TYPE_ID}`)
    .then(response => response.json())
    .then(stations => {
      stations.map ((station) => {
        station['key'] = station['id'];
        station['text'] = station['attributes']['name'];
        station['value'] = station['attributes']['name'];
      });
      setStations(stations);
    })
    .catch(error => {
      // Can log this error to kibana for monitoring purposes. 
      console.log(error);
      setErrorMessage('Unable to load station list. Please try again later.');
    });
  }, []);

  const onStationSelection = (event, data) => {
    setCurrentStation(data.value);
  }

  return (
    <div className="board">
     <Menu>
        <Menu.Item
          name={TEXT_HOME}
          active={true}
        />
      </Menu>
      <Container>
      <Card centered className="clock" color="olive">
        <Card.Content>
          <Card.Header textAlign="center"><Clock format={'h:mm:ssa'} ticking={true} timezone={Intl.DateTimeFormat().resolvedOptions().timeZone} /></Card.Header>
          <Card.Description textAlign="center">
            <span className='date'> {DAYS[today.getDay()]} {today.getMonth()+1}/{today.getDate()} </span>
          </Card.Description>
        </Card.Content>
      </Card>
      <Divider horizontal className="divider">
        {TEXT_SCHEDULE}
      </Divider>  
      <div className="schedule">
        <Header size='small'>{TEXT_CHOOSE_STATION}:</Header> 
        {errorMessage}
        <Dropdown placeholder={TEXT_STATION_NAME} selection search options={allStations} onChange={onStationSelection}/>
        {currentStation && (
          <Schedule currentStation={currentStation}/>
        )}
      </div>
      </Container>
    </div>
  );
}

export default DepartureBoard;
