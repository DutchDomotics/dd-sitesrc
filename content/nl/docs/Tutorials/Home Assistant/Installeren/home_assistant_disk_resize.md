---
title: "Home Assistant VM disk resize"
linkTitle: "HA - VM disk resize"
date: 2021-01-26
weight: 3
slug: disk-resize-home-assistant-vm
author: Gabrie van Zanten
description: >
  Resize van de virtuele disk van de Home Assistant OS VM.
---

{{% pageinfo %}}
Disk uitbreiding van de Home Assistant OS VM
{{% /pageinfo %}}

## Disk vol
Naar mate je Home Assistant meer en meer gebruikt en er ook meer logging in geschreven wordt, data van sensoren bewaard wordt, kan het gebeuren dat Home Assistant opeens klaagt over ruimte gebrek. Je ziet dan bijvoorbeeld deze melding in de logs: 
```yaml
'HomeAssistantCore.update' blocked from execution, not enough free space (0.8GB) left on the device
```

Wanneer je Home Assistant OS draait in een VM, is de oplossing gelukkig heel simpel:
1) Resize de disk
2) Herstart Home Assisant OS.

## Resizen van de disk
Wanneer je gebruik maakt van VMware ESXi of Hyper-V, dan selecteer je de VM, gaat naar de eigenschappen van de disk en vergroot de disk naar de nieuwe waarde. Wanneer je nu Home Assistant herstart, zal deze automatisch de nieuwe disk size herkennen en de partitie vergroten tot de nieuwe maximale grootte.

Gebruik je ProxMox dan voltstaat het om op de command line de uitbreiding op te geven middels ```qm resize <vmid> <disk> <size>```. Wil je bijvoorbeeld van 16GB naar 24GB, dan doe je dat via het volgende commando: ```qm resize 100 virtio0 +8G```. Ook nu voer je een reboot uit van Home Assistant OS voor automatische resize van de partitie.

## Controle
Om te controleren of de nieuwe disksize goed verwerkt is, log je in op de console van de Home Assistant OS VM. Login met de user root, er wordt geen wachtwoord gevraagd.
Type nu ```login``` om op de command line te komen en controleer dan via ```fdisk -l``` of de disk de nieuwe grootte heeft en of /dev/sda8 op een paar MB na, ook de nieuwe grootte heeft.

