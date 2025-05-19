// Holds all company objects
let companyList = [];

// Utility to sanitize company name into a filename-safe format
// remove special characters
// replace spaces with hyphens
function sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // removes everything except word chars, space, dash
      .replace(/\s+/g, '-')     // replace spaces with hyphens
      .replace(/\./g, '');      // specifically remove dots
  }

function extractCompanyDetails(href,preExtractedName) {
    // Get the section containing the company's details on the page
    return cy.get('.company-details').then($details => {
      // Extracts the company name from the header  
      const name = preExtractedName; // fix: get proper name
      // All contact items (Address, Email, etc.) are grouped in this list
      const contactItems = $details.find('.company-contacts-item');
      // Helper function to find the text (or link) based on its label and search for specific label
      const getItemTextByLabel = (label) => {
        const item = contactItems.filter((_, el) =>
          Cypress.$(el).find('.company-contacts-item-title').text().trim() === label
        );
        if (item.length > 0) {
          const link = item.find('a').attr('href');
          const span = item.find('span').text().trim();
          return link || span;
        }
        return '';
      };
      // Extract all specific fields from the DOM
      const address = getItemTextByLabel('Address');
      const website = getItemTextByLabel('WWW');
      const telephone = getItemTextByLabel('Telephone');
      const medicalInfoLine = getItemTextByLabel('Medical Information Direct Line');
      const email = getItemTextByLabel('E-mail');
      const medicalEmail = getItemTextByLabel('Medical Information e–mail');
  
      let logoSrc = $details.find('img').attr('src') || '';
      const sanitizedName = sanitizeFilename(name);
      const logoFilename = sanitizedName ? `${sanitizedName}.png` : '';
  
      const company = {
        name,
        url: `${Cypress.env('baseSiteUrl')}${href}`,
        address,
        website,
        telephone,
        medicalInfoLine,
        email,
        medicalEmail,
        logo: logoSrc ? `logos/${logoFilename}` : '',
      };
  
      const fullLogoUrl = logoSrc.startsWith('http') ? logoSrc : `${Cypress.env('baseSiteUrl')}${logoSrc}`;
  
      if (logoSrc && logoFilename) {
        cy.task('downloadImage', { url: fullLogoUrl, filename: logoFilename });
      }
  
      cy.task('saveCompanyData', company);
      cy.log(`Saved company: ${name}`);
      companyList.push(company);
    });
  }
  
  function processCompaniesOnPage() {
    return cy.get('.browse-results .emc-link').then($items => {
      const total = $items.length;
      if (total === 0) {
        cy.log('No company entries found on this page.');
        return;
      }
  
      const indices = [0, 2,total-1]; // Adjust as needed
  
      const companies = indices.map(i => {
        const safeIndex = Math.min(i, total - 1);
        const $link = $items.eq(safeIndex);
        const href = $link.attr('href');
        const name = $link.text().trim(); // Extracting name here directly
        return { href, name };
      });
  
      return cy.wrap(companies).each(({ href, name }) => {
        const fullUrl = `${Cypress.env('baseSiteUrl')}${href}`;
        cy.visit(fullUrl);
        extractCompanyDetails(href, name); // pass name
        cy.visit(Cypress.env('baseCompanyListUrl'));
        cy.wait(500);
      });
    });
  }
  


function visitAlphabetTab(letter) {
  cy.get('.browse-menu').then($menu => {
    const $link = $menu.find('a').filter((_, el) => el.textContent.trim() === letter);
    if ($link.length) {
      cy.wrap($link).click({ force: true });
      cy.wait(1000);
      return processCompaniesOnPage();
    } else {
      cy.log(`No link found for letter: ${letter}`);
      return cy.wrap(null);
    }
  });
}

describe('Company Scraper with Logo Download and JSON Output', () => {
  it('Scrapes companies and stores details + logo', () => {
    // Step 1: Visit the full company listing page
    cy.visit(Cypress.env('baseCompanyListUrl'));

    const letters = ['A', 'B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; // Add more as needed
    cy.wrap(letters).each(letter => {
      visitAlphabetTab(letter);
    });
  });
});
