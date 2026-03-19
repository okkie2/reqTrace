# Statement Network Model – Samenvatting

Dit document vat het model samen zodat je er direct weer mee verder kunt.

---

## 1. Kernidee

Het systeem is een **netwerk van herleidbare beweringen (statements)**.

Alles is een statement:
- eis
- interpretatie
- uitwerking
- besluit
- bewijs
- vraag
- risico

Er zijn geen aparte objecttypen zoals “requirement” of “rubriek”.
Het verschil zit in het **statement_type**.

---

## 2. Structuur

### Statement

Minimale structuur:

```yaml
id: "000123"
broncode: "FR-eu02.01.1.a"

statement_type: eis
niveau: 2
order: 10

title: "Identificatie patiënt op basis van demografische data"

text_origineel: >
  ...

text_nl: >
  ...

parents:
  - "000045"

relations: []
```

---

## 3. Belangrijkste principes

### 3.1 Alles is een statement

- Geen attributen voor interpretaties of besluiten
- Alles met betekenis krijgt een eigen node

### 3.2 Scheiding van soorten informatie

- eis = wat moet
- interpretatie = wat betekent het
- uitwerking = wat doen wij
- besluit = welke keuze maken we

### 3.3 Hiërarchie ≠ structuur

- `parents` = hiërarchische ophanging
- `relations` = betekenisvolle verbindingen

Hiërarchie is slechts één perspectief op het netwerk

### 3.4 Niveau is ondersteunend

- `niveau` helpt bij filtering en views
- maar bepaalt niet de echte structuur

---

## 4. Statement types (v1)

- eis
- interpretatie
- uitwerking
- besluit
- bewijs
- vraag
- risico

---

## 5. Relaties (beperkt houden)

- verplicht_wegens
- vertaling_van
- detail_van
- uitgewerkt_in

Regel:
→ max 4–6 relatietypes
→ semantisch scherp

---

## 6. Attributen (v1)

### Identiteit
- id (intern, stabiel)
- broncode (extern)

### Inhoud
- title
- text_origineel
- text_nl
- opmerking (optioneel)

### Structuur
- niveau
- order
- parents
- relations

### Context
- bron
- moscow
- relevantie
- increment

---

## 7. Wat bewust NIET in v1 zit

- geen aparte “rubriek” entiteit
- geen interpretatie als veld
- geen workpackage als type
- geen projectmanagement (takenbord)

---

## 8. Ubiquitous Language

De glossary is opgeslagen in YAML per categorie:

- modelkern.yaml
- statement-types.yaml
- traceability.yaml
- attributen.yaml
- domein.yaml
- governance.yaml

Regels:
- elke term komt 1x voor
- YAML is bron van waarheid

---

## 9. Workflow (praktisch)

### Stap 1 – Bron toevoegen
- registreer bron + broncodes

### Stap 2 – Eis vastleggen
- maak statement_type = eis

### Stap 3 – Interpretatie toevoegen
- aparte statement
- relatie naar eis

### Stap 4 – Uitwerking toevoegen
- aparte statement

### Stap 5 – Besluiten vastleggen
- expliciet als statement

---

## 10. Belangrijkste risico

Het model wordt te complex.

Mitigatie:
- weinig types
- weinig relaties
- strikte definities
- tooling (validatie/linting)

---

## 11. Mentale shortcut

Als je twijfelt:

→ “Is dit een bewering?”

Ja → maak een statement
Nee → geen onderdeel van dit model

---

## 12. Waar morgen op doorpakken

1. Eén concrete bron (bijv. FR-eu02.01.1.a)
2. Modelleer:
   - eis
   - interpretatie(s)
   - uitwerking(en)
3. Check:
   - klopt type?
   - klopt relatie?
   - ontbreekt er iets?

Daar vind je de echte gaten in je model.
