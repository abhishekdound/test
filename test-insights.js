// Test script for LLM Insight Generation with Gemini API
const fetch = require('node-fetch');

// Test the backend insights endpoint
async function testBackendInsights() {
    console.log('🧪 Testing Backend LLM Insights Generation...\n');
    
    const testContent = "Artificial Intelligence (AI) is transforming healthcare by enabling early disease detection, personalized treatment plans, and automated medical imaging analysis. Machine learning algorithms can now process vast amounts of patient data to identify patterns that human doctors might miss. This technology is particularly promising in radiology, where AI systems can detect tumors and other abnormalities with high accuracy.";
    
    try {
        console.log('📤 Sending request to backend insights endpoint...');
        console.log('Content:', testContent.substring(0, 100) + '...\n');
        
        const response = await fetch('http://localhost:8080/api/frontend/insights/demo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                sectionContent: testContent,
                persona: 'researcher',
                jobToBeDone: 'selected text analysis'
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend Response:');
            console.log('Success:', data.success);
            console.log('Job ID:', data.jobId);
            console.log('Persona:', data.persona);
            console.log('Source:', data.source);
            console.log('Timestamp:', new Date(data.timestamp).toLocaleString());
            
            if (data.insights) {
                console.log('\n🤖 Generated Insights:');
                Object.keys(data.insights).forEach(key => {
                    if (Array.isArray(data.insights[key])) {
                        console.log(`\n${key.toUpperCase()}:`);
                        data.insights[key].forEach((insight, index) => {
                            console.log(`  ${index + 1}. ${insight}`);
                        });
                    }
                });
            }
        } else {
            console.log('❌ Backend Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Error Details:', errorText);
        }
    } catch (error) {
        console.log('❌ Network Error:', error.message);
    }
}

// Test direct Gemini API call
async function testDirectGeminiAPI() {
    console.log('\n🔑 Testing Direct Gemini API Call...\n');
    
    const testContent = "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. Deep learning, a type of machine learning, uses neural networks with multiple layers to process complex patterns in data.";
    
    try {
        const geminiApiKey = process.env.GEMINI_API_KEY || 'AIzaSyBvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQvQ';
        
        console.log('📤 Sending request to Gemini API directly...');
        console.log('Content:', testContent.substring(0, 100) + '...\n');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Analyze this selected text and provide insights in JSON format:
                        
                        TEXT: "${testContent}"
                        
                        Please provide insights in this format:
                        {
                            "keyInsights": ["Key insight 1", "Key insight 2"],
                            "didYouKnow": ["Interesting fact 1", "Interesting fact 2"],
                            "connections": ["Connection 1", "Connection 2"],
                            "inspirations": ["Inspiration 1", "Inspiration 2"]
                        }`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Gemini API Response:');
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const geminiText = data.candidates[0].content.parts[0].text;
                console.log('Raw Response:', geminiText.substring(0, 200) + '...');
                
                // Try to parse JSON from response
                try {
                    const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        console.log('\n📊 Parsed Insights:');
                        Object.keys(parsed).forEach(key => {
                            if (Array.isArray(parsed[key])) {
                                console.log(`\n${key.toUpperCase()}:`);
                                parsed[key].forEach((insight, index) => {
                                    console.log(`  ${index + 1}. ${insight}`);
                                });
                            }
                        });
                    }
                } catch (parseError) {
                    console.log('⚠️ Could not parse JSON from response');
                }
            }
        } else {
            console.log('❌ Gemini API Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Error Details:', errorText);
        }
    } catch (error) {
        console.log('❌ Network Error:', error.message);
    }
}

// Test frontend insights API
async function testFrontendInsightsAPI() {
    console.log('\n🌐 Testing Frontend Insights API...\n');
    
    const testContent = "Natural Language Processing (NLP) is a branch of AI that helps computers understand, interpret, and generate human language. It powers applications like chatbots, language translation, and sentiment analysis. Recent advances in transformer models have significantly improved NLP capabilities.";
    
    try {
        console.log('📤 Sending request to frontend insights API...');
        console.log('Content:', testContent.substring(0, 100) + '...\n');
        
        const response = await fetch('http://localhost:3000/api/generate-insights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: testContent,
                useSelectedText: true,
                analysisType: 'comprehensive'
            }),
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Frontend API Response:');
            
            if (data.insights && Array.isArray(data.insights)) {
                console.log(`\n📊 Generated ${data.insights.length} Insights:`);
                data.insights.forEach((insight, index) => {
                    console.log(`\n${index + 1}. ${insight.type.toUpperCase()}: ${insight.title}`);
                    console.log(`   Content: ${insight.content}`);
                    console.log(`   Confidence: ${insight.confidence}%`);
                    console.log(`   Sources: ${insight.sources.join(', ')}`);
                });
            }
        } else {
            console.log('❌ Frontend API Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Error Details:', errorText);
        }
    } catch (error) {
        console.log('❌ Network Error:', error.message);
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting LLM Insight Generation Tests\n');
    console.log('=' .repeat(60));
    
    await testBackendInsights();
    console.log('\n' + '=' .repeat(60));
    
    await testDirectGeminiAPI();
    console.log('\n' + '=' .repeat(60));
    
    await testFrontendInsightsAPI();
    console.log('\n' + '=' .repeat(60));
    
    console.log('\n✅ All tests completed!');
}

// Run the tests
runAllTests().catch(console.error);
