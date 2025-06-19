const { builder } = require('@netlify/functions');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

exports.handler = builder(async (event) => {
  try {
    const { url } = JSON.parse(event.body);
    if (!url) return { statusCode: 400, body: "Missing URL" };

    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return {
      statusCode: 200,
      body: JSON.stringify({ text: article?.textContent || "No se pudo extraer texto" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal error" })
    };
  }
});
