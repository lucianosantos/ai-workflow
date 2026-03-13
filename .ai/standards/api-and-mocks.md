# API And Mock Standards

> Standards when working with mock data

# This file is intended when working with mock data. You can add patterns and standards here.

## API integration

When working on API integrations, also create or update the existing mocks, so there is no drift between mocks and APIs.

---

## Mocks

- To create fake values on mocks, use the project's fake-data library if it already exists. If the repo uses `faker`, typical examples are:

  - id: `faker.string.uuid()`
  - option from array: `faker.helpers.arrayElement(optionsArray)`
  - description: `faker.string.lorem()`
  - currencyName: `faker.finance.currencyName()`
  - currencyCode: `faker.finance.bic()`
  - int: `faker.number.int({ min: minValue, max: maxValue })`
  - float: `faker.number.float({ min: value, max: value, fractionDigits: digits })`
  - email: `faker.internet.email()`
  - unspecified values: infer from the fake-data API

- CRUD operations should use an ephemeral list so delete/create/edit operations actually change the initial dataset. This dataset is changed in the current browser "session", and a page refresh resets it. Keep the pattern aligned with an existing CRUD mock structure in the repo.
