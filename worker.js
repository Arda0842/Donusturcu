const groqResp = await fetch(
  'https://api.groq.com/openai/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: parts.map(p => p.text || '').join('\n') }],
      max_tokens: 4096
    })
  }
);

const groqData = await groqResp.json();
const text = groqData.choices?.[0]?.message?.content || JSON.stringify(groqData);
