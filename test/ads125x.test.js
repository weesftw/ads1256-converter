/* global describe it */

import { should } from 'chai';
import { ADS125x } from '../../';

should();

describe('ADS125x', () => {

  const config = {
    drdyPin: 17,
    resetPin: 18,
    pdwnPin: 27,
    csPin: 22,
    spiChannel: 1,
  };

  const a = new ADS125x(config);

  it('should setup an ADC instance', () => {
    a.should.be.ok;
  });
});
