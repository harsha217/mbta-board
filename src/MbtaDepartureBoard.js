import React, {useEffect, useState} from 'react';
import {Dropdown, Container, Menu, Header, Card, Divider} from 'semantic-ui-react'
import Clock from 'react-live-clock';
import Schedule from './Schedule.js';
import './MbtaDepartureBoard.css';

const COMMUTER_RAIL_ROUTE_TYPE_ID = 2;
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TEXT_HOME = 'Home';
const TEXT_SCHEDULE = 'SCHEDULE';
const TEXT_SELECT_STATION = 'Select Station';

const MbtaDepartureBoard = () => {
  const [allStations, setStations] = useState(0);
  const [currentStation, setCurrentStation] = useState('');
  const today = new Date();
  useEffect(() => {
    fetch(`/api/v1/getStops/${COMMUTER_RAIL_ROUTE_TYPE_ID}`).then(response => response.json()).then(stations => {
      stations.map ((station) => {
        station['key'] = station['id'];
        station['text'] = station['attributes']['name'];
        station['value'] = station['attributes']['name'];
      });
      setStations(stations);
    });
  }, []);

  const onStationSelection = (event, data) => {
    setCurrentStation(data.value);
  }

  return (
    <div className="departureBoard">
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
        <Header size='small'>Choose Station:</Header> 
        <Dropdown placeholder={TEXT_SELECT_STATION} selection search options={allStations} onChange={onStationSelection}/>
        {currentStation && (
          <Schedule currentStation={currentStation}/>
        )}
      </div>
      </Container>
    </div>
  );
}

export default MbtaDepartureBoard;
