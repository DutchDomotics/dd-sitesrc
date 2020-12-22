---
title: "RoboRock S5 Max in HA zonder root"
date: 2020-12-20
weight: 3
slug: roborock-s5-max-homeassistant-zonder-root
author: Gabrie van Zanten
description: >
  Installatie van RoboRock S5 Max stofzuiger in Home Assistant zonder rooting van de stofzuiger.
---

{{% pageinfo %}}
LET OP: Deze tutorial is gebaseerd op RoboRock S5 Max firmware 01.10.26 en Home Assistant OS 2020.12.1 en uitgevoerd op MacOS.
{{% /pageinfo %}}

## Gebruikte bronnen:
Home Assistant Vacuum integratie: https://www.dutchdomotics.info/docs/tutorials/roborock-s5-max-homeassistant-zonder-root/

Gain root on BlueStacks: https://android.stackexchange.com/questions/224119/how-to-gain-root-on-bluestacks-android-emulator

Github Repository: https://github.com/89jd/hass-roborock

BlueStacks Android emulator: https://www.bluestacks.com/
> :warning: **Dit is geen volledige Home Assistant ondersteunde integratie, maak altijd backups voor je begint.**

## Globale stappen
Om de RoboRock S5 Max stofzuiger via Home Assistant te bedienen is de "Hass-RoboRock" custom component nodig. Deze praat via Tuya tegen de stofzuiger. Om via Tuya te kunnen praten, zijn de "localKey" en "devID" nodig. Deze keys kunnen we achterhalen via de android app op de telefoon en rooting van die telefoon, maar veel makkelijker is het om de BlueStacks Android Emulator op je PC of Mac te installeren. Via die emulator kunnen we dan makkelijk root rechten krijgen en vervolgens installatie van de RoboRock Android app in BlueStacks en dan exporteren van de beide keys. Als de keys eenmaal geexporteerd zijn, hebben we BlueStacks niet meer nodig.

De tweede fase is dan het opnemen van de "Hass-RoboRock" custom component in HA met behulp van de beide keys, gevolgd door het aanmaken van een paar mooie dasboard cards.

![](http://localhost:1313/docs/tutorials/roborock-s5-max-homeassistant-zonder-root/images/roborock.jpg)

## Installatie BlueStacks
Eerste stap is de installatie van BlueStacks. Download BlueStacks via https://www.bluestacks.com/download.html en installeer de applicatie. Standaard werkt BlueStacks met een virtuele machine en de virtuele android machine (android.vbox) heeft na installatie de root disk beveiligd tegen schrijven. Aangezien we later in de procedure hier wel naar toe schrijven, moeten we deze disken op Read/Write zetten.

In MacOS open een terminal venster en edit de file: "~/Library/BlueStacks/Android/Android.vbox". In deze file zie je een aantal entries voor HardDisk staan. Pas het type aan naar "Normal".

```html
<MediaRegistry>
  <HardDisks>
    <HardDisk uuid="{4da0cf19-7a5d-474d-9748-2c31c11fbbd6}" location="fastboot.vdi" format="VDI" type="Normal"/>
    <HardDisk uuid="{fca296ce-8268-4ed7-a57f-d32ec11ab304}" location="Root.vdi" format="VDI" type="Normal"/>
    <HardDisk uuid="{a9d1a5d3-cd0c-4169-9284-69b19f57b517}" location="Data.vdi" format="VDI" type="Normal"/>
  </HardDisks>
</MediaRegistry>
```

Sla de wijzigingen op, laat je terminal window nog even open, daar komen we dadelijk nog terug. In MacOS start BlueStacks en volg onderstaande stappen:
1) In BlueStacks installeer je de RoboRock app via de playstore
2) Log in de RoboRock app in met hetzelfde account als de RoboRock app op je telefoon. Je moet nu je stofzuiger ook in BlueStacks kunnen zien.
3) In de BlueStacks app enable je de Android Debug Bridge (ADB) via BlueStacks Preferences -> Perferences.
4) In je MacOS terminal ga je naar de BlueStacks directory via:
```bash
cd /Applications/BlueStacks.app/Contents/MacOS
```

5) Switch naar root user in je MacOS terminal:
```bash
sudo su
```

6) Download nu de SuperSU zip file waarmee in BlueStacks SuperUser rechten verkregen worden:
```bash
sudo curl https://supersuroot.org/downloads/SuperSU-v2.82-201705271822.zip -o SuperSU-v2.82-201705271822.zip
```

7) Met het volgende commando starten we de ADB (Android Debug Bridge) en wordt een verbinding naar BlueStacks mogelijk:
```bash
./adb start-server
```

8) Controleer of er een device emulator online is gekomen:
```bash
./adb devices
```
Hier zie je nu de emulator connectie van BlueStacks. Soms moet je een aantal keren proberen. Je kunt de ADB server stoppen via "kill-server" en dan weer opnieuw starten en kijken of BlueStacks nu wel in de devices beschikbaar komt.

9) Vervolgens uploaden we de SuperUser zip naar de virtuele SDcard in BlueStacks:
```bash
./adb push ./SuperSU-v2.82-201705271822.zip /mnt/sdcard
```

10) Dan openen we een shell naar BlueStacks zodat we in BlueStacks op de command line uitkomen:
```bash
./adb shell
```

11) Middels de volgende commando's wordt nu de SuperUser zip uitgepakt en geinstalleerd:
```bash
# Switch naar root via de BlueStacks binary:
system/xbin/bstk/su

# Disable SELinux
setenforce 0

# Opnieuw mounten van de disken in RW mode:
mount -o rw,remount,rw /
mount -o rw,remount,rw /system
mount -o rw,remount,exec,rw /storage/emulated

# Unzip SuperSU zip
cd /mnt/sdcard
mkdir supersu
cd supersu
unzip ../SuperSU-v2.82-201705271822.zip

# Kopieren van het su commando en installatie vna su:
cp x64/su /system/xbin/su
chmod a+rwx /system/xbin/su
/system/xbin/su --install

# Start su daemon mode
/system/xbin/su --daemon
```

12) In BlueStacks is nu de SU daemon geinstalleerd. Waarschijnlijk is de BlueStacks sessie vastgelopen en moet je bluestacks opnieuw opstarten.
13) Na opnieuw starten van BlueStacks zoek je de SuperSU in BlueStacks op en Controleer of deze actief is.
14) switch naar de MacOS terminal en start opnieuw de shell op en switch naar su. Het kan zijn dat je weer eerst stap 7 & 8 moet uitvoer om BlueStacks in de device emulator te zien.
```bash
./adb shell
su
```
Er verschijnt nu de melding: "ADB Shell has been granted.". Dit bewijst dat je root user op de emulator geworden bent.

15) We gaan nu naar de lokatie van de RoboRock app in BlueStacks om daar via het uitlezen van een cache file achter de localKey en devID te komen:
```bash
cd /data/data/com.roborock.smart/files/rr_cache
find . | egrep rr_tuya_[0-9]
```

16) De filenaam van stap 15 is de file die de tuya informatie bevat. Deze file kopieren we naar de virtuele SDCard:
```bash
cp rr_tuya_59533 /mnt/sdcard
```

17) Sluit de ADB Shell sessie af via CTRL+D en download de tuya file van de SDcard naar je lokale MacOS, uitpakken en vervolgens de file openen:
```bash
./adb pull /mnt/sdcard/rr_tuya_595287 /tmp/token.gz
cd /tmp
gzip -d token.gz
vi token
```

18) Zoek in deze file naar "localKey" en "devID". Noteer de keys die hier achter staan, bijvoorbeeld:
```bash
"localKey":"78215e844dc09e53"
"devId":"bf943b226c5bc35b22mdko"
```

## Configuratie in Home Assistant
In Home Assistant ga je naar HACS, dan naar integrations en klik rechtsboven op het menu. Kies custom Repositories en plak de volgende URL en kies category integration:
```bash
https://github.com/89jd/hass-roborock
```
Herstart Home Assistant.

Om de stofzuiger zichtbaar te krijgen, heeft deze de NPM module nodig die normaal niet in Home Assistant zit. Om deze te installeren op een HA OS gebaseerde installatie, op je de homeassistant container (ik gebruik hier portainer voor) en run het commando:
```bash
apk add --update nodejs npm
```
Deze actie moet je na elke stop en start van de home assistant container doen. Niet bij de standaard "restart". Er zijn ook methodes om dit ook nog te automatiseren, zie bijvoorbeeld https://community.home-assistant.io/t/custom-component-roborock-communication/229032/34, maar die heb ik niet verder onderzocht omdat ik nog te onervaren ben in Home Assistant en wil voorkomen dat ik de container permanent beschadig.

Wanneer je nu in HA naar de HA integrations gaat (dus niet HACS), kun je daar de RoboRock integratie toevoegen. Deze vraagt vervolgens om de naam, IP, localKey en devID. De naam die je hier in vult is de naam zoals deze straks als entity beschikbaar komt. In het voorbeeld heb ik als naam "roborock s5 max" gebruikt, wat later zichtbaar is als "roborock_s5_max" als entity.

Ga in HA naar configuration -> entities. The RoboRock verschijnt hier nu als een entity.

## Aansturen RoboRock
Om de RoboRock aan te sturen heb je nu de beschikking over een aantal services die je kunt aanroepen. Deze staan uitvoerig beschreven in https://www.home-assistant.io/integrations/vacuum/. Om te testen of de RoboRock aan te sturen is, ga je naar HA -> Developer Tools -> Services. Kies hier de service "vacuum.start" en als service data:
```yaml
entity_id: vacuum.roborock_s5_max
```
Als je nu op "Call Service" klikt, moet de RoboRock al gaan beginnen. Dit is het bewijs dat de integratie gelukt is.

## Kamers in RoboRock aanduiden
Via de RoboRock app kun je een enkele of meerdere rooms aanduiden om te stofzuigen. Als je dit vanuit Home Assistant wilt doen, dan worden deze aangeduid als segmenten. Momenteel is er nog geen mogelijkheid om de segmenten die beschikbaar zijn uit te lezen, dus zul je moeten testen welke segment ID overeenstemt met welke kamer. De segment IDs beginnen vanaf id 15. 
Ga weer naar HA -> Developer Tools -> Services en selecteer "roborock.vacuum_clean_segment". Voor de service data vul je in:
```yaml
segments:
  - 15
entity_id: vacuum.roborock_s5_max
```
Voordat je op "Call Service" klikt, open je de RoboRock App en kijk naar de plattegrond. Klik nu op "call service". Hopelijk springt de RoboRock nu aan en zie je na enkele seconden in de App de kamer kleuren die gezogen gaat worden. Op deze manier test je dus kamer voor kamer, tot je ze allemaal gevonden hebt.
Wil je later in een automation meerdere segmenten aanspreken, dan kan dit als volgt:
```yaml
segments:
  - 20
  - 22
```
