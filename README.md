# Assignment-Cypress-QA
Assignment - Cypress QA |

# Medicines.org.uk Company Scraper 

A Cypress-based web scraper to extract pharmaceutical company data from [medicines.org.uk](https://www.medicines.org.uk/). 
It captures details like name, address, contact info, and downloads the company logo.


├── cypress/
│ ├── e2e/
│ │ └── companyScraper.cy.js
│ └── support/
├── logos/ # Downloaded logos (auto-created)
├── data/
│ └── companies.json # Output file
├── cypress.config.js
├── package.json
└── README.md

1. Clone the Repo
npm install
npx cypress run --e2e
# OR for interactive
npx cypress open

Features
Extracts company name, contact info, emails, and website.

Downloads and names logos based on company name.

Stores output in data/companies.json.
---
