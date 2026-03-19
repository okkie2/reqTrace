# Ubiquitous Language (DDD)

Deze map bevat de Ubiquitous Language (DDD (Domain-Driven Design)) voor het NCPeH-domein.

De termen vormen de gedeelde taal voor:
- requirements
- interpretaties
- besluitvorming
- documentatie

YAML is de bron van waarheid. Andere vormen (zoals Markdown of Hugo) worden hieruit afgeleid.

---

## Structuur

Bestanden:

- modelkern.yaml  
  Basisconcepten van het model (zoals statement, id, niveau)

- statement-types.yaml  
  Toegestane soorten statements (zoals eis, interpretatie, uitwerking)

- traceability.yaml  
  Relaties en structuur (zoals parent, relatie, herleidbaarheid)

- attributen.yaml  
  Eigenschappen van statements (zoals title, text_origineel, moscow, relevantie)

- domein.yaml  
  Begrippen uit het eHealth / NCPeH domein (zoals NCPeH, Patient Summary, ISM)

- governance.yaml  
  Begrippen rond verantwoordelijkheid, besluitvorming en beheer (zoals owner, DoD)

---

## Regels

- Elke term komt exact één keer voor (single source of truth)
- Elke term hoort bij precies één categorie
- YAML is leidend; andere representaties zijn afgeleid
- Nieuwe termen alleen toevoegen als ze:
  - nodig zijn voor besluitvorming, of
  - aantoonbaar verwarring voorkomen

---

## Richtlijnen per categorie

- modelkern  
  Alleen concepten die nodig zijn om het model zelf te begrijpen

- statement-types  
  Alleen typen van statements, geen attributen of domeintermen

- traceability  
  Alleen relaties en structuur, geen inhoudelijke betekenis

- attributen  
  Alleen velden die op een statement staan

- domein  
  Alleen inhoudelijke eHealth / NCPeH begrippen

- governance  
  Alleen termen rond verantwoordelijkheid, eigenaarschap en proces

---

## Gebruik

- Gebruik deze termen consequent in:
  - requirements
  - documentatie
  - communicatie

- Vermijd synoniemen die in de glossary als verboden staan

- Twijfel over een term?
  → voeg eerst toe aan de glossary voordat je hem gebruikt

---

## Evolutie

Deze Ubiquitous Language is levend.

Wijzigingen:
- gebeuren expliciet
- worden besproken binnen het team
- worden direct doorgevoerd in de YAML

Doel:
→ steeds minder interpretatieverschillen
→ steeds hogere herleidbaarheid
