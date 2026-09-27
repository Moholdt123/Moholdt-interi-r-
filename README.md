# Moholdt Interiør

Statisk nettside på GitHub Pages med prisestimat og kundeforespørsler.

## Innsending

Skjemaet sender via FormSubmit til mottakeradressen i `mail.js`. Bytt `config.recipient` der for å endre mottaker; en ny adresse må aktiveres på nytt.

1. Send en tydelig merket testforespørsel fra den publiserte nettsiden.
2. Fullfør FormSubmits sikkerhetssjekk.
3. Åpne aktiveringsmeldingen fra FormSubmit i mottakerens innboks (sjekk søppelpost) og bekreft adressen.
4. Send deretter en ny test, og kontroller at e-posten faktisk kommer fram og at Svar går til kundens e-postadresse.

Aktivering og faktisk levering er ikke bekreftet av kodeendringen alene.

Forespørselen inneholder kontaktinformasjon, jobbadresse, rom og areal, ønsket arbeid, inkluderte tjenester, estimat, tidspunkt, underlag, materialopplysninger og kundens beskjed. Bilder sendes som separate vedlegg (maks 10 MB totalt). Prisene er foreløpige og må kvalitetssikres.

Innsending bruker vanlig POST med FormSubmits CAPTCHA. Kunden forlater siden for sikkerhetssjekken og returnerer til `takk.html` etter godkjent behandling. Ingen automatisk jobbaksept, tilbud eller kunde-e-post sendes. E-postens Reply-To peker på kunden.

Skjemaet lagrer ikke nye forespørsler lokalt. Den gamle adminsiden er en separat lokal demonstrasjon, og er ikke en innboks for de innsendte forespørslene.

## Arbeidsområde

Inntil 90 minutters kjøring én vei fra Vikersund. Postnummer og adresse samles inn, men sjekken gjøres manuelt av Moholdt. Ingen automatisk avvisning ut fra adresse.

## Opplysninger og drift

FormSubmit behandler skjemaopplysninger og bilder. Se https://formsubmit.co/documentation for leverandørens vilkår. Ingen API-nøkler eller passord skal legges i dette offentlige repositoriet.
