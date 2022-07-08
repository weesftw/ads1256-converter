import { ADS125x } from './ads125x';

const config = {
    drdyPin: 17,
    resetPin: 18,
    pdwnPin: 27,
    csPin: 22,
    spiChannel: 1,
};

const a = new ADS125x(config);
a.calibrateSelf()
    .then(() => a.wakeup());