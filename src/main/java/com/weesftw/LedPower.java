package com.weesftw;

import com.pi4j.context.Context;
import com.pi4j.io.gpio.digital.DigitalOutput;
import com.pi4j.io.gpio.digital.DigitalState;
import com.pi4j.plugin.pigpio.provider.gpio.digital.PiGpioDigitalOutputProvider;

import java.util.concurrent.TimeUnit;

public class LedPower {

    public LedPower(Context context) {
        var led = context.create(
                DigitalOutput.newConfigBuilder(context)
                        .id("led-id")
                        .address(22)
                        .shutdown(DigitalState.LOW)
                        .initial(DigitalState.LOW)
                        .provider(PiGpioDigitalOutputProvider.ID));

        while(true) {
            led.pulse(3, TimeUnit.SECONDS, DigitalState.HIGH);
            led.pulse(3, TimeUnit.SECONDS, DigitalState.LOW);
        }
    }
}
