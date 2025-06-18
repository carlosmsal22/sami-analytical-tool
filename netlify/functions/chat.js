const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Configuration constants
const CONFIG = {
  POLL_INTERVAL: 1000, // 1 second
  MAX_POLL_ATTEMPTS: 120, // 2 minutes max
  RUN_TIMEOUT: 60000, // 60 seconds timeout for initial run
  ASSISTANT_ID: process.env.ASSISTANT_ID,
  MODEL: "gpt-4o",
  MAX_PROMPT_LENGTH: 10000,
  MAX_FILE_IDS: 20
};

exports.handler = async function (event) {
  // Set CORS headers for all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers
    };
  }

  // Validate HTTP method
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    // Validate request body
    if (!event.body) {
      throw new Error("Missing request body");
    }

    const body = JSON.parse(event.body);
    const { prompt, file_ids = [], thread_id } = body;

    // Input validation
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid or missing prompt");
    }

    if (prompt.length > CONFIG.MAX_PROMPT_LENGTH) {
      throw new Error(`Prompt exceeds maximum length of ${CONFIG.MAX_PROMPT_LENGTH} characters`);
    }

    if (file_ids.length > CONFIG.MAX_FILE_IDS) {
      throw new Error(`Exceeded maximum of ${CONFIG.MAX_FILE_IDS} files`);
    }

    // Use existing thread or create new one
    const thread = thread_id 
      ? { id: thread_id }
      : await openai.beta.threads.create();

    // Add user message
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: prompt,
      ...(file_ids.length > 0 && { file_ids })
    });

    // Run the assistant with timeout protection
    let run;
    try {
      run = await Promise.race([
        openai.beta.threads.runs.create(thread.id, {
          assistant_id: CONFIG.ASSISTANT_ID,
          model: CONFIG.MODEL,
          tools: [{ type: "code_interpreter" }]
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Assistant initialization timeout")), CONFIG.RUN_TIMEOUT)
        )
      ]);
    } catch (error) {
      throw new Error(`Failed to start assistant: ${error.message}`);
    }

    // Poll for completion with attempts limit
    let attempts = 0;
    let runStatus;
    let lastError = null;
    
    while (attempts < CONFIG.MAX_POLL_ATTEMPTS) {
      try {
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        
        if (runStatus.status === "completed") break;
        if (runStatus.status === "failed") {
          lastError = runStatus.last_error;
          throw new Error(`Run failed: ${lastError?.message || "Unknown error"}`);
        }
        if (["cancelled", "expired"].includes(runStatus.status)) {
          throw new Error(`Run was ${runStatus.status}`);
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, CONFIG.POLL_INTERVAL));
      } catch (error) {
        console.error(`Polling attempt ${attempts} failed:`, error);
        lastError = error;
        // Continue polling unless we have a terminal error
        if (error.message.includes("failed") || error.message.includes("cancelled") || error.message.includes("expired")) {
          throw error;
        }
      }
    }

    // Handle timeout or incomplete status
    if (runStatus.status !== "completed") {
      throw new Error(lastError || `Run timed out after ${CONFIG.MAX_POLL_ATTEMPTS} seconds`);
    }

    // Get the response messages
    const messages = await openai.beta.threads.messages.list(thread.id, {
      limit: 1,
      order: "desc"
    });

    if (!messages.data.length) {
      throw new Error("No response from assistant");
    }

    // Process response content
    const response = messages.data[0].content
      .filter(c => c.type === "text")
      .map(c => {
        // Handle annotations if present
        if (c.text.annotations && c.text.annotations.length > 0) {
          let text = c.text.value;
          // Process annotations (e.g., file references)
          c.text.annotations.forEach(annotation => {
            if (annotation.type === "file_path") {
              text = text.replace(annotation.text, `[file: ${annotation.file_path.file_id}]`);
            }
          });
          return text;
        }
        return c.text.value;
      })
      .join("\n\n");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        output: response || "[No text response]",
        thread_id: thread.id, // Return thread ID for continued conversation
        run_id: run.id,
        completed_at: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error("Error in chat function:", error);
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
        success: false,
        timestamp: new Date().toISOString()
      })
    };
  }
};