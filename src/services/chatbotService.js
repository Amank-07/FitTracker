// ChatBot Service for ChatGPT Integration
// This service handles communication with OpenAI's ChatGPT API

// OpenAI API configuration
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const chatWithGPT = async (message, user, conversationHistory = []) => {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare the conversation context
    const systemPrompt = `You are an AI fitness assistant helping ${user?.name || 'a user'} with their fitness journey. 
    
    Your role is to provide personalized, helpful, and safe fitness advice. You can help with:
    - Workout plans and exercise recommendations
    - Nutrition advice and meal planning
    - Motivation and goal setting
    - Fitness tracking tips
    - General health and wellness guidance
    
    Important guidelines:
    - Always prioritize safety and recommend consulting healthcare professionals for medical advice
    - Provide practical, actionable advice
    - Be encouraging and supportive
    - Consider the user's fitness level and goals
    - Keep responses concise but informative
    - Use emojis to make responses friendly and engaging
    - Format responses with bullet points and clear structure
    
    User context: ${user?.name ? `Name: ${user.name}` : 'New user'}`;

    // Prepare messages for the API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({ // Keep last 10 messages for context
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI API...');

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    throw error;
  }
};

// Fallback responses when API is not available
export const getFallbackResponse = (message, user) => {
  const lowerMessage = message.toLowerCase();
  
  // Fitness-related responses
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return `Great question about workouts! 💪 Here are some personalized suggestions for you:

• **Beginner**: Start with bodyweight exercises like push-ups, squats, and planks
• **Intermediate**: Try circuit training with 30-45 second intervals
• **Advanced**: Consider HIIT workouts or strength training with weights

What's your current fitness level? I can provide more specific recommendations!`;
  }

  if (lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('food')) {
    return `Nutrition is key to your fitness journey! 🥗 Here's some guidance:

• **Protein**: Aim for 0.8-1.2g per kg of body weight
• **Hydration**: Drink 8-10 glasses of water daily
• **Meal timing**: Eat within 30 minutes after workouts
• **Balanced meals**: Include protein, carbs, and healthy fats

Would you like me to help you create a meal plan or calculate your daily calorie needs?`;
  }

  if (lowerMessage.includes('motivation') || lowerMessage.includes('motivated')) {
    return `I understand! Motivation can be challenging. Here are some tips to stay motivated: 🔥

• **Set SMART goals**: Specific, Measurable, Achievable, Relevant, Time-bound
• **Track your progress**: Use our app to log workouts and see improvements
• **Find a workout buddy**: Accountability partners work wonders
• **Mix it up**: Try new exercises to keep things interesting
• **Celebrate small wins**: Every workout completed is a victory!

Remember: Consistency beats perfection. What's one small step you can take today?`;
  }

  if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
    return `Weight loss is a common goal! Here's a balanced approach: ⚖️

• **Calorie deficit**: Consume fewer calories than you burn
• **Strength training**: Build muscle to boost metabolism
• **Cardio**: Include 150+ minutes of moderate cardio weekly
• **Sleep**: Aim for 7-9 hours of quality sleep
• **Stress management**: High stress can affect weight loss

The key is sustainable changes. Would you like help calculating your daily calorie needs?`;
  }

  if (lowerMessage.includes('muscle') || lowerMessage.includes('build muscle')) {
    return `Building muscle is awesome! Here's your roadmap: 🏋️‍♂️

• **Progressive overload**: Gradually increase weight or reps
• **Compound exercises**: Focus on squats, deadlifts, bench press
• **Protein intake**: 1.6-2.2g per kg of body weight
• **Rest days**: Muscles grow during recovery
• **Consistency**: Stick to your routine for 8-12 weeks

What's your current strength training experience? I can suggest specific exercises!`;
  }

  if (lowerMessage.includes('cardio') || lowerMessage.includes('running') || lowerMessage.includes('cycling')) {
    return `Cardio is essential for heart health! Here are some options: ❤️

• **Low intensity**: Walking, cycling, swimming (30-60 minutes)
• **Moderate intensity**: Jogging, dancing, hiking (150+ minutes/week)
• **High intensity**: HIIT, sprinting, circuit training (75+ minutes/week)

Start where you're comfortable and gradually increase intensity. What type of cardio interests you most?`;
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello ${user?.name || 'there'}! 👋 How can I help you with your fitness journey today? I'm here to provide personalized guidance for workouts, nutrition, motivation, and more!`;
  }

  if (lowerMessage.includes('thank')) {
    return `You're very welcome! 😊 I'm here to support your fitness journey. Don't hesitate to ask if you need more guidance on workouts, nutrition, or motivation. Keep up the great work! 💪`;
  }

  // Default response
  return `That's an interesting question! 🤔 While I can provide general fitness guidance, for specific medical advice, please consult with a healthcare professional. 

I can help you with:
• Workout plans and exercises
• Nutrition and meal planning
• Motivation and goal setting
• Fitness tracking tips
• General health and wellness

What specific area would you like to explore?`;
};

// Save chat history to localStorage
export const saveChatHistory = (userId, messages) => {
  try {
    localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

// Load chat history from localStorage
export const loadChatHistory = (userId) => {
  try {
    const history = localStorage.getItem(`chat_history_${userId}`);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
};

// Clear chat history
export const clearChatHistory = (userId) => {
  try {
    localStorage.removeItem(`chat_history_${userId}`);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}; 