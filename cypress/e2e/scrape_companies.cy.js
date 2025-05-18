let companyList = [];

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

function extractCompanyDetails(href) {
    return cy.get('.company-details').then($details => {
      const name = $details.find('h1.company-header').text().trim(); // fix: get proper name
      const contactItems = $details.find('.company-contacts-item');
  
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
      cy.log(`✅ Saved company: ${name}`);
      companyList.push(company);
    });
  }
  
function processCompaniesOnPage() {
  return cy.get('.browse-results .emc-link').then($items => {
    const total = $items.length;
    if (total === 0) {
      cy.log('⚠️ No company entries found on this page.');
      return;
    }

    const indices = [0, 2]; // Adjust as needed

    const hrefs = indices.map(i => {
      const safeIndex = Math.min(i, total - 1);
      return $items.eq(safeIndex).attr('href');
    });

    return cy.wrap(hrefs).each(href => {
      const fullUrl = `${Cypress.env('baseSiteUrl')}${href}`;
      cy.visit(fullUrl);
      extractCompanyDetails(href);
      cy.visit(Cypress.env('baseCompanyListUrl')); // safer than `cy.go('back')`
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
      cy.log(`❌ No link found for letter: ${letter}`);
      return cy.wrap(null);
    }
  });
}

describe('Company Scraper with Logo Download and JSON Output', () => {
  it('Scrapes companies and stores details + logo', () => {
    cy.visit(Cypress.env('baseCompanyListUrl'));

    const letters = ['A', 'B']; // Add more as needed
    cy.wrap(letters).each(letter => {
      visitAlphabetTab(letter);
    });
  });
});
