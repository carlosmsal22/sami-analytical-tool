// File: netlify/functions/dualUpload.js

const fs = require('fs');
const path = require('path');
const os = require('os');
const multiparty = require('multiparty');
const py = require('child_process');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const form = new multiparty.Form();

  return new Promise((resolve, reject) => {
    form.parse(event, async (err, fields, files) => {
      if (err) {
        return resolve({ statusCode: 500, body: 'Upload error: ' + err.message });
      }

      const uploaded = files.file?.[0];
      if (!uploaded) {
        return resolve({ statusCode: 400, body: 'No file uploaded.' });
      }

      const ext = path.extname(uploaded.originalFilename).toLowerCase();
      const tmpPath = uploaded.path;
      let pythonScript;

      if (ext === '.sav') {
        pythonScript = 'analyze_sav.py';
      } else if (ext === '.xlsx' || ext === '.xls') {
        pythonScript = 'analyze_excel.py';
      } else if (ext === '.csv') {
        pythonScript = 'analyze_csv.py';
      } else {
        return resolve({
          statusCode: 400,
          body: 'Unsupported file type: ' + ext,
        });
      }

      try {
        const pyProcess = py.spawnSync('python3', [path.join(__dirname, pythonScript), tmpPath]);

        if (pyProcess.error) {
          return resolve({ statusCode: 500, body: 'Python error: ' + pyProcess.error.message });
        }

        return resolve({
          statusCode: 200,
          body: pyProcess.stdout.toString(),
        });
      } catch (error) {
        return resolve({
          statusCode: 500,
          body: 'Error running Python script: ' + error.message,
        });
      }
    });
  });
};
