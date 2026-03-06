// Direct OpenAI connection test
import OpenAI from 'openai';

// Configure OpenAI client - project keys shouldn't use organization header
const isProjectKey = process.env.OPENAI_API_KEY?.startsWith('sk-proj-');

let client;
if (isProjectKey) {
  console.log('🔑 Using project-scoped API key (no org header)');
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log('🏢 Using legacy API key with organization');
  const config = { apiKey: process.env.OPENAI_API_KEY };
  if (process.env.OPENAI_ORG_ID) {
    config.organization = process.env.OPENAI_ORG_ID;
  }
  client = new OpenAI(config);
}

async function testConnection() {
  console.log('🔄 Testing OpenAI connection...');
  console.log('API Key present:', !!process.env.OPENAI_API_KEY);
  console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
  
  try {
    // Test with minimal request
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo', // Try cheaper model first
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5
    });
    
    console.log('✅ OpenAI Connection Successful!');
    console.log('Response:', response.choices[0].message.content);
    console.log('Model:', response.model);
    console.log('Usage:', response.usage);
    
    // Now test gpt-4o
    const gpt4Response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5
    });
    
    console.log('✅ GPT-4O also working!');
    console.log('GPT-4O Response:', gpt4Response.choices[0].message.content);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Error code:', error.code);
    console.log('Error type:', error.type);
    
    if (error.code === 'insufficient_quota') {
      console.log('\n💡 SOLUTION STEPS:');
      console.log('1. Check OpenAI Dashboard: https://platform.openai.com/account/usage');
      console.log('2. Add payment method: https://platform.openai.com/account/billing');
      console.log('3. Purchase credits or upgrade plan');
      console.log('4. Wait 2-5 minutes for activation');
      console.log('5. Your NEKAH app will work immediately after!');
    }
  }
}

testConnection();