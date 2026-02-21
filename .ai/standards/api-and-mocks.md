# API & Mocks Standards

> Standards when working with mock data

# This file is intended when working with mock data. You can add patterns and standards here.

## API integration

When working on API integrations, also create or update the existing mocks, so there is no drift between mocks and APIs

---

## Mocks

-   To create fake values on the mocks, use faker lib. E.g.:

    -   id: faker.string.uuid()
    -   option from array: faker.helpers.arrayElement(**optionsArray**).value
    -   description: faker.string.lorem()
    -   currencyName: faker.finance.currencyName()
    -   currencyCode: faker.finance.bic()
    -   int: faker.number.int({ min: **minValueForTheTask**, max: **maxValueForTheTask** })
    -   float: faker.number.float({ min: **valueForTheTask**, max: **valueForTheTask**, fractionDigits: **valueForTheTask** })
    -   email: faker.internet.email()
    -   **unspecified_value**: infer from faker api
