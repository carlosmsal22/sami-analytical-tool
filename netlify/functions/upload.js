const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

exports.handler = async function (event) {
  try {
    const fileData = event.body;
    const fileName = event.headers["x-file-name"];

    const buffer = Buffer.from(fileData, "base64");

    const file = await openai.files.create({
      file: buffer,
      purpose: "assistants",
      name: fileName
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: file.id })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};

