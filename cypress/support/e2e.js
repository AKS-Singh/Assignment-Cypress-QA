import './commands';

Cypress.on('uncaught:exception', () => {
    // Ignore any uncaught errors so scraping continues
    return false;
  });