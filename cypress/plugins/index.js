const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

module.exports = (on, config) => {
  on('task', {
    saveCompanyData(data) {
      fs.writeFileSync('cypress/results/companyData.json', JSON.stringify(data, null, 2));
      return null;
    },

    downloadImage({ url, filename }) {
      const dest = path.join(__dirname, '..', '..', 'logos', filename);
      const mod = url.startsWith('https') ? https : http;

      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        mod.get(url, response => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve(true));
          });
        }).on('error', err => {
          fs.unlink(dest, () => reject(err));
        });
      });
    }
  });
};
