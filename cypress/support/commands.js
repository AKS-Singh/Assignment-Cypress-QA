Cypress.Commands.add('extractCompanyDetails', (href, companyList) => {
  cy.get('h1').first().then($h1 => {
    const name = $h1.text().trim();

    // Find contact information
    let contact = '';
    cy.get('.contact-section, .contact-details').then($contact => {
      contact = $contact.text().trim();
    });

    // Find and download logo
    cy.get('img').first().then($img => {
      const logoUrl = $img.attr('src');
      const filename = `${name.replace(/\s+/g, '_')}.png`;

      // Save logo image
      cy.task('downloadImage', { url: logoUrl, filename });

      // Add to internal array
      companyList.push({
        name,
        contact,
        logo: `logos/${filename}`,
        sourceUrl: `${Cypress.env('baseSiteUrl')}${href}`
      });
    });
  });
});
