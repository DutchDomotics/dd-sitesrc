---
title: "Garage poort met motion sensor"
linkTitle: "Garage poort met motion sensor"
date: 2021-01-04
weight: 3
slug: garage-poort-met-motion-sensor
author: Gabrie van Zanten
description: >
  Controleren of de garage poort open staat terwijl er niemand aanwezig is.
---

{{% pageinfo %}}
Dit automation voorbeeld werkt op basis van een deursensor in combinatie met een bewegingsmelder.
{{% /pageinfo %}}

## De use case
De garage poort bij mij thuis kan via de Home Assistant app geopend en gesloten worden. Dit heb ik gedaan via het doorbell project van Frenck https://frenck.dev/diy-smart-doorbell-for-just-2-dollar/#1-smart-doorbell-stuff-youll-need. Het is daarmee zo makkelijk geworden om de poort via de app te bedienen dat de kinderen vaak meteen doorlopen, in de app op sluiten klikken en eigenlijk niet controleren of de poort ook wel echt dicht gaat. Daarom wil ik een repeterende melding krijgen zolang de poort open staat, tenzij er nog iemand in de garage aanwezig is. 

De componenten die ik hiervoor gebruik zijn twee op zigbee gebaseerde devices:
- een deursensor SONOFF SNZB-04 via zigbee en ZHA gekoppeld
- een Xiaomi Human Body Sensor ook via zigbee en ZHA gekoppeld.

De Xiaomi sensor heeft een eigen time-out van 2 minuten. D.w.z. dat als deze 2 minuten lang geen beweging meer gedecteerd heeft, dan schakelt deze van ON naar OFF. Die ingebouwde time-out schijn je aan te kunnen passen via een hack, maar dit heb ik niet geprobeerd omdat voor mij de 2 minuten prima zijn. 

Essentieel is dat de melding blijft herhalen totdat de poort dicht is. 

## Wanneer moet er een trigger zijn?
Soms helpt het om even in een simpele tabel te zetten, wanneer er wat moet gebeuren. In mijn geval heb ik twee devices (poort en motion) die een status kunnen hebben:
|             |  Motion | Geen Motion |
|-------------|---------|-------------|
| Poort Open  |  niks   | melding     |
| Poort dicht |  niks   | niks        |

Dus alleen als "Poort Open" EN "Geen Motion" dan wil ik een melding krijgen en anders geen actie uitvoeren.

## Het script
Het script begint natuurlijk op de standaard manier met een alias en een omschrijving:
```yaml
alias: Garagepoort staat open zonder beweging
description: Verstuur een melding als de garagepoort te lang open staat.
```

Eerst had ik de automation zo gemaakt dat de trigger de schakeling van de motion sensor naar off was en als condition van de poort open was, er dan een melding volgt. Maar daar zit een denkfout in, want stel nu dat de poort geopend wordt zonder dat iemand door de sensor loopt, bijvoorbeeld per ongeluk in de app de poort openklikken, dan wordt de motion off nooit getriggerd en volgt er dus nooit een melding.

Er moet dus een continue check zijn op de status van de twee sensoren. Hiervoor kun je een time_pattern https://www.home-assistant.io/docs/automation/trigger/#time-pattern-trigger gebruiken. Voor het time_pattern stel je een tijd in uren, minuten, seconden in. Dit is niet de tijd van de cyclus, maar is meer een cron tijd check. Dus seconds: "15" triggert elke keer dat de huidige tijd op 15 seconden staat en dus NIET elke 15 seconden. Ik kies er voor om in mijn automation op 30 seconden een controle te doen. 

```yaml
trigger:
  - platform: time_pattern
    seconds: '30'
    hours: '*'
    minutes: '*'
```

Wanneer dan de trigger plaatsvindt, dan moeten er dus twee condities gecheckt worden. De garagepoort moet open staan, dus ON en de motion sensor moet geen beweging zien, dat is status OFF. Dit kan via een AND condition:
```yaml
condition:
  - condition: state
    entity_id: binary_sensor.garagepoort
    state: 'on'
  - condition: and
    conditions:
      - condition: state
        entity_id: binary_sensor.lumi_sensor_motion_garage
        state: 'off'
```

Vervolgens plakken we er een actie aan. Zelf test ik meestal via Telegram notificaties:
```yaml
action:
  - service: notify.telegram
    data:
      message: De garagepoort is open zonder beweging.
mode: single
```

En zo stond er nooit meer een garage poort te lang open.
