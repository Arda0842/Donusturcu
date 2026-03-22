export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const messages = body.messages || [];
      const lastMessage = messages[messages.length - 1];

      let parts = [];
      if (Array.isArray(lastMessage.content)) {
        for (const item of lastMessage.content) {
          if (item.type === 'text') {
            parts.push({ text: item.text });
          } else if (item.type === 'image') {
            parts.push({ inline_data: { mime_type: item.source.media_type, data: item.source.data } });
          } else if (item.type === 'document') {
            parts.push({ inline_data: { mime_type: 'application/pdf', data: item.source.data } });
          }
        }
      } else {
        parts.push({ text: lastMessage.content });
      }

      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }], generationConfig: { maxOutputTokens: 4096 } })
        }
      );

      const geminiData = await geminiResp.json();
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(geminiData);

      return new Response(JSON.stringify({ content: [{ type: 'text', text }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
