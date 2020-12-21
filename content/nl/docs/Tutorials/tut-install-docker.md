---
title: "Docker + Docker-Compose"
date: 2020-12-20
weight: 3
slug: docker-docker-compose-installeren
description: >
  Docker samen met Docker-Compose installeren.
---

> :warning: **Controleer altijd het script voordat je het installeert!**  
> :warning: **Deze tutorial is gebaseerd op Ubuntu 18.04 & 20.04!**

## Volledige documentatie installatie Docker: 
Docker: https://docs.docker.com/engine/install/ubuntu/  
Docker-compose: https://docs.docker.com/compose/install/


## Docker
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
