import React from 'react';
import {shallow, configure} from 'enzyme';
import DepartureBoard from './DepartureBoard';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ 
      attributes: {"name": "South Acton"}, id: "South Acton" }]),
  })
);

describe('DepartureBoard', () => {
  it('Renders Homepage and does not throw errors', () => {
    expect(() => 
      shallow(<DepartureBoard/>)
    ).not.toThrow();
  });
});
