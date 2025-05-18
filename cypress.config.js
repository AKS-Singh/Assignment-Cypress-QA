const { defineConfig } = require('cypress');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const dataPath = path.join(__dirname, 'cypress', 'data', 'companies.json');
const logosDir = path.join(__dirname, 'cypress', 'logos');

// Ensure folders exist
fs.ensureDirSync(logosDir);
fs.ensureFileSync(dataPath);
if (fs.readFileSync(dataPath, 'utf8').trim() === '') {
  fs.writeFileSync(dataPath, '[]'); // Initialize as empty array
}

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        downloadImage({ url, filename }) {
          const filePath = path.join(logosDir, filename);
          return axios({
            method: 'GET',
            url,
            responseType: 'stream',
          }).then((response) => {
            return new Promise((resolve, reject) => {
              const writer = fs.createWriteStream(filePath);
              response.data.pipe(writer);
              writer.on('finish', () => resolve(`Saved ${filename}`));
              writer.on('error', reject);
            });
          });
        },

        saveCompanyData(company) {
          const companies = fs.readJsonSync(dataPath);
          companies.push(company);
          fs.writeJsonSync(dataPath, companies, { spaces: 2 });
          return `Saved company: ${company.name}`;
        },
      });

      return config;
    },

    env: {
      baseCompanyListUrl: 'https://www.medicines.org.uk/emc/browse-companies',
      baseSiteUrl: 'https://www.medicines.org.uk',
    },
  },
});
