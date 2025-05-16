const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

exports.handler = async function (event) {
  try {
    const body = JSON.parse(event.body);
    const { prompt, file_ids = [] } = body;

    // Create a new thread
    const thread = await openai.beta.threads.create();

    // Add user message
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
      file_ids: file_ids.length > 0 ? file_ids : undefined
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: "YOUR_ASSISTANT_ID_IF_ANY", // optional
      model: "gpt-4o",
      tools: [{ type: "code_interpreter" }]
    });

    // Poll for result
    let output;
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (runStatus.status === "completed") break;
      await new Promise((res) => setTimeout(res, 1000));
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const last = messages.data[0].content;

    output = last
      .map((c) => (c.type === "text" ? c.text.value : "[Unsupported content]"))
      .join("\n");

    return {
      statusCode: 200,
      body: JSON.stringify({ output })
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};

