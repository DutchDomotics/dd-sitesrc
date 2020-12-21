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
Gain root on BlueStacks: https://android.stackexchange.com/questions/224119/how-to-gain-root-on-bluestacks-android-emulator
Github Repository: https://github.com/89jd/hass-roborock
BlueStacks Android emulator: https://www.bluestacks.com/
> :warning: **Dit is geen volledige Home Assistant ondersteunde integratie, maak altijd backups voor je begint.**

## Globale stappen
Om de RoboRock S5 Max stofzuiger via Home Assistant te bedienen is de "Hass-RoboRock" custom component nodig. Deze praat via Tuya tegen de stofzuiger. Om via Tuya te kunnen praten, zijn de "localKey" en "devID" nodig. Deze keys kunnen we achterhalen via de android app op de telefoon en rooting van die telefoon, maar veel makkelijker is het om de BlueStacks Android Emulator op je PC of Mac te installeren. Via die emulator kunnen we dan makkelijk root rechten krijgen en vervolgens installatie van de RoboRock Android app in BlueStacks en dan exporteren van de beide keys. Als de keys eenmaal geexporteerd zijn, hebben we BlueStacks niet meer nodig.

De tweede fase is dan het opnemen van de "Hass-RoboRock" custom component in HA met behulp van de beide keys, gevolgd door het aanmaken van een paar mooie dasboard cards.


## Installatie BlueStacks
Eerste stap is de installatie van BlueStacks. Download BlueStacks via https://www.bluestacks.com/download.html en installeer de applicatie. Standaard werkt BlueStacks met een virtuele machine en de virtuele android machine (android.vbox) heeft na installatie de root disk beveiligd tegen schrijven. Aangezien we later in de procedure hier wel naar toe schrijven, moeten we deze disken op Read/Write zetten.

In MacOS open een terminal venster en edit de file: "~/Library/BlueStacks/Android/Android.vbox". In deze file zie je een aantal entries voor HardDisk staan. Pas het type aan naar "Normal".

...
<MediaRegistry>
  <HardDisks>
    <HardDisk uuid="{4da0cf19-7a5d-474d-9748-2c31c11fbbd6}" location="fastboot.vdi" format="VDI" type="Normal"/>
    <HardDisk uuid="{fca296ce-8268-4ed7-a57f-d32ec11ab304}" location="Root.vdi" format="VDI" type="Normal"/>
    <HardDisk uuid="{a9d1a5d3-cd0c-4169-9284-69b19f57b517}" location="Data.vdi" format="VDI" type="Normal"/>
  </HardDisks>
</MediaRegistry>
...

Sla de wijzigingen op, laat je terminal window nog even open, daar komen we dadelijk nog terug. In MacOS start BlueStacks en volg onderstaande stappen:
1) In BlueStacks installeer je de RoboRock app via de playstore
2) Log in de RoboRock app in met hetzelfde account als de RoboRock app op je telefoon. Je moet nu je stofzuiger ook in BlueStacks kunnen zien.
3) In de BlueStacks app enable je de Android Debug Bridge (ADB) via BlueStacks Preferences -> Perferences.
4) In je MacOS terminal ga je naar de BlueStacks directory via:
...
cd /Applications/BlueStacks.app/Contents/MacOS
...

5) Switch naar root user in je MacOS terminal:
...
sudo su
...

6) Download nu de SuperSU zip file waarmee in BlueStacks SuperUser rechten verkregen worden:
...
sudo curl https://supersuroot.org/downloads/SuperSU-v2.82-201705271822.zip -o SuperSU-v2.82-201705271822.zip
...

7) Met het volgende commando starten we de ADB (Android Debug Bridge) en wordt een verbinding naar BlueStacks mogelijk:
...
./adb start-server
...

8) Controleer of er een device emulator online is gekomen:
...
./adb devices
...
Hier zie je nu de emulator connectie van BlueStacks. Soms moet je een aantal keren proberen. Je kunt de ADB server stoppen via "kill-server" en dan weer opnieuw starten en kijken of BlueStacks nu wel in de devices beschikbaar komt.

9) Vervolgens uploaden we de SuperUser zip naar de virtuele SDcard in BlueStacks:
...
./adb push ./SuperSU-v2.82-201705271822.zip /mnt/sdcard
...

10) Dan openen we een shell naar BlueStacks zodat we in BlueStacks op de command line uitkomen:
...
./adb shell
...

11) Middels de volgende commando's wordt nu de SuperUser zip uitgepakt en geinstalleerd:
...
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
...

12) In BlueStacks is nu de SU daemon geinstalleerd. Waarschijnlijk is de BlueStacks sessie vastgelopen en moet je bluestacks opnieuw opstarten.
13) Na opnieuw starten van BlueStacks zoek je de SuperSU in BlueStacks op en Controleer of deze actief is.
14) switch naar de MacOS terminal en start opnieuw de shell op en switch naar su. Het kan zijn dat je weer eerst stap 7 & 8 moet uitvoer om BlueStacks in de device emulator te zien.
...
./adb shell
su
...
Er verschijnt nu de melding: "ADB Shell has been granted.". Dit bewijst dat je root user op de emulator geworden bent.

15) We gaan nu naar de lokatie van de RoboRock app in BlueStacks om daar via het uitlezen van een cache file achter de localKey en devID te komen:
...
cd /data/data/com.roborock.smart/files/rr_cache
find . | egrep rr_tuya_[0-9]
...

16) De filenaam van stap 15 is de file die de tuya informatie bevat. Deze file kopieren we naar de virtuele SDCard:
...
cp rr_tuya_59533 /mnt/sdcard
...

17) Sluit de ADB Shell sessie af via CTRL+D en download de tuya file van de SDcard naar je lokale MacOS, uitpakken en vervolgens de file openen:
...
./adb pull /mnt/sdcard/rr_tuya_595287 /tmp/token.gz
cd /tmp
gzip -d token.gz
vi token
...

18) Zoek in deze file naar "localKey" en "devID". Noteer de keys die hier achter staan, bijvoorbeeld:
...
"localKey":"78215e844dc09e53"
"devId":"bf943b226c5bc35b22mdko"
...


## Configuratie in Home Assistant






Eerst installeren we Docker d.m.v. het convenience script.

```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Voeg je user toe aan de "docker" group zodat je niet elke keer sudo hoeft in te typen.



```
sudo usermod -aG docker <user>
```

## Docker-Compose

Daarna installeren we Docker-Compose

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

Test de instalatie:

```
docker-compose --version
```

Als je output lijkt op ``docker-compose version 1.27.4, build 01110ad01`` zit je goed.


:tada::tada::tada:

Gefeliciteerd! Je hebt nu Docker en Docker-Compose draaien en bent klaar voor de mooie wereld van het selfhosten.

:tada::tada::tada:
