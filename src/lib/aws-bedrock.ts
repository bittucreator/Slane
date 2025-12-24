/**
 * @author Shiva Nagendra Babu Kore
 */

import { ENV, API, BUSINESS } from './constants';

// Task interface for type safety
interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | string;
}

// Azure OpenAI GPT-5 Service
interface AzureMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AzureResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class LlamaAIService {
  private static readonly AZURE_ENDPOINT = ENV.AZURE_ENDPOINT;
  private static readonly AZURE_API_KEY = ENV.AZURE_API_KEY;
  private static readonly DEPLOYMENT_NAME = ENV.AZURE_DEPLOYMENT_NAME;
  private static readonly API_VERSION = ENV.AZURE_API_VERSION;

  static async generateResponse(userMessage: string, conversationHistory: AzureMessage[] = [], currentTasks: Task[] = [], retryCount = 0): Promise<string> {
    // Validate required Azure configuration
    if (!this.AZURE_API_KEY || !this.AZURE_ENDPOINT || !this.DEPLOYMENT_NAME || !this.API_VERSION) {
      const missing = [];
      if (!this.AZURE_API_KEY) missing.push('NEXT_PUBLIC_AZURE_API_KEY');
      if (!this.AZURE_ENDPOINT) missing.push('NEXT_PUBLIC_AZURE_ENDPOINT');
      if (!this.DEPLOYMENT_NAME) missing.push('NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME');
      if (!this.API_VERSION) missing.push('NEXT_PUBLIC_AZURE_API_VERSION');
      throw new Error(`Azure OpenAI configuration missing: ${missing.join(', ')}`);
    }

    try {
      // Get current date information for the AI
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const tomorrow = new Date(now.getTime() + BUSINESS.MILLISECONDS_PER_DAY).toISOString().split('T')[0];
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

      // Analyze current tasks for AI context
      const taskStats = {
        total: currentTasks.length,
        completed: currentTasks.filter(t => t.completed).length,
        active: currentTasks.filter(t => !t.completed).length,
        high: currentTasks.filter(t => t.priority === 'high').length,
        medium: currentTasks.filter(t => t.priority === 'medium').length,
        low: currentTasks.filter(t => t.priority === 'low').length,
        overdue: currentTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
          const todayDate = new Date(today);
          return dueDate < todayDate;
        }).length,
        dueToday: currentTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
          const todayDate = new Date(today);
          return dueDate.toDateString() === todayDate.toDateString();
        }).length,
        dueTomorrow: currentTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
          const tomorrowDate = new Date(tomorrow);
          return dueDate.toDateString() === tomorrowDate.toDateString();
        }).length
      };

      // Create task list summary for AI
      const taskSummary = currentTasks.length > 0 
        ? currentTasks.map(task => {
            const dueDateStr = task.dueDate 
              ? `, due: ${(task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : '';
            return `- "${task.title}" (${task.priority} priority, ${task.completed ? 'completed' : 'active'}${dueDateStr})`;
          }).join('\n')
        : 'No tasks currently in the list';

      // Prepare messages for Azure OpenAI (OpenAI format)
      const messages: AzureMessage[] = [
        {
          role: 'system',
          content: `You are Slane AI, a helpful task management assistant built into the Slane task management app. You help users manage their tasks, provide productivity advice, and assist with planning. Keep responses concise, helpful, and friendly. Focus on actionable advice and clear communication.

**FORMATTING GUIDELINES:**
- Use **bold** for important numbers, counts, and key information
- Use *italics* for emphasis
- Use bullet points with - for lists
- Use numbered lists for steps
- Keep formatting clean and readable
- DO NOT use emojis in responses - keep text professional and clean

**CURRENT DATE CONTEXT:**
Today is ${today} (${dayOfWeek})
Tomorrow is ${tomorrow}

**CURRENT TASK LIST & ANALYTICS:**
Total tasks: ${taskStats.total}
- Active tasks: ${taskStats.active}
- Completed tasks: ${taskStats.completed}
- High priority: ${taskStats.high}
- Medium priority: ${taskStats.medium}
- Low priority: ${taskStats.low}
- Overdue tasks: ${taskStats.overdue}
- Due today: ${taskStats.dueToday}
- Due tomorrow: ${taskStats.dueTomorrow}

**TASK LIST:**
${taskSummary}

**TASK ANALYTICS & QUERIES:**
You can answer questions about the user's tasks like:
- "How many high priority tasks do I have?" → Answer: ${taskStats.high}
- "What tasks are due today?" → List tasks due today
- "Show me overdue tasks" → List overdue tasks
- "How am I doing with my tasks?" → Provide analysis

**TASK MANAGEMENT CAPABILITIES:**
1. **ANALYZE**: Answer questions about current tasks, priorities, due dates
2. **CREATE**: Create new tasks using CREATE_TASK format
3. **SUGGEST**: Provide productivity advice based on current workload

**TASK CREATION CAPABILITY:**
You can create tasks directly for users. When a user asks you to create a task or mentions something they need to do, you should create tasks for them using this format:

CREATE_TASK: {title: "Task Title", description: "Task Description", priority: "low|medium|high", dueDate: "YYYY-MM-DD"}

**Examples:**
- User: "I need to call my dentist tomorrow"
  Response: "I'll create that task for you! CREATE_TASK: {title: "Call dentist", description: "Schedule appointment", priority: "medium", dueDate: "${tomorrow}"}"

- User: "I need to finish the project report by next Friday"
  Response: "I'll add that to your tasks! CREATE_TASK: {title: "Finish project report", description: "Complete and review the project report", priority: "high", dueDate: "[calculate the next Friday date]"} Make sure to break it down into smaller steps if it's a large project."

- User: "Add buy groceries to my list"
  Response: "Added to your task list! CREATE_TASK: {title: "Buy groceries", description: "", priority: "low", dueDate: ""}"

**RULES:**
1. Create tasks when users explicitly ask or mention something they need to do
2. Set appropriate priority levels (low, medium, high) 
3. Calculate dates correctly based on the current date context provided above
4. Use YYYY-MM-DD format for dates
5. When users say "tomorrow", use ${tomorrow}
6. When users say "today", use ${today}
7. For other relative dates (next week, Friday, etc.), calculate from the current date
8. Keep task titles concise but clear
9. Add helpful descriptions when relevant
10. Respond naturally while including the CREATE_TASK command

**IMPORTANT:** Do NOT set up reminders or recurring notifications. Only create tasks. You can help with task organization, productivity tips, time management, and general task-related questions while actively creating tasks when needed.`
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      const requestBody = {
        messages: messages,
        max_tokens: API.DEFAULT_MAX_TOKENS,
        temperature: API.DEFAULT_TEMPERATURE,
        top_p: API.DEFAULT_TOP_P,
        stream: false
      };

      const url = `${this.AZURE_ENDPOINT}/openai/deployments/${this.DEPLOYMENT_NAME}/chat/completions?api-version=${this.API_VERSION}`;


      console.log('Making Azure OpenAI request to:', url);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'api-key': this.AZURE_API_KEY ? '[REDACTED]' : '[MISSING]'
      });

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.AZURE_API_KEY
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      }).catch((fetchError) => {
        clearTimeout(timeoutId);
        console.error('Fetch error details:', {
          name: fetchError.name,
          message: fetchError.message,
          cause: fetchError.cause,
          stack: fetchError.stack
        });
        
        if (fetchError.name === 'AbortError') {
          throw new Error(`Request timeout: Azure OpenAI request took longer than ${API.REQUEST_TIMEOUT / 1000} seconds. This may be due to network issues or high server load.`);
        }
        
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          // More specific error detection
          if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            throw new Error('Network error: No internet connection detected. Please check your network connection and try again.');
          }
          
          throw new Error('Network error: Unable to connect to Azure OpenAI. This could be due to:\n• Network connectivity issues\n• Firewall or proxy blocking the request\n• Azure OpenAI service temporarily unavailable\n• Browser security restrictions\n\nTry refreshing the page or checking your network connection.');
        }
        
        throw new Error(`Network request failed: ${fetchError.message}`);
      });

      clearTimeout(timeoutId);


      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        
        if (response.status === 401) {
          throw new Error('Invalid Azure OpenAI API key. Please check your credentials.');
        }
        
        if (response.status === 404) {
          throw new Error('Azure OpenAI deployment not found. Please check the deployment name and endpoint.');
        }
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        
        throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: AzureResponse = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from Azure OpenAI');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry logic for transient errors
      const isRetryableError = (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('network') ||
        errorMessage.includes('temporarily unavailable')
      );
      
      if (isRetryableError && retryCount < 2) {
        console.log(`Retrying Azure OpenAI request (attempt ${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, API.RETRY_DELAY * (retryCount + 1))); // Exponential backoff
        return this.generateResponse(userMessage, conversationHistory, currentTasks, retryCount + 1);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unexpected error occurred while calling Azure OpenAI');
    }
  }

  static async processTaskMessage(
    userMessage: string,
    conversationHistory: AzureMessage[] = [],
    currentTasks: Task[] = []
  ): Promise<string> {
    try {
      const response = await this.generateResponse(userMessage, conversationHistory, currentTasks);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Azure OpenAI Error:', errorMessage);
      
      // Provide helpful error messages based on the error type
      if (errorMessage.includes('API key not configured') || errorMessage.includes('configuration missing')) {
        return "❌ **Azure OpenAI Configuration Error**\n\nThe Azure OpenAI service is not properly configured. Please check that all required environment variables are set:\n- NEXT_PUBLIC_AZURE_ENDPOINT\n- NEXT_PUBLIC_AZURE_API_KEY\n- NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME\n- NEXT_PUBLIC_AZURE_API_VERSION";
      } else if (errorMessage.includes('Invalid Azure OpenAI API key')) {
        return "❌ **Invalid API Key**\n\nThe Azure OpenAI API key appears to be invalid. Please verify your credentials in the Azure portal.";
      } else if (errorMessage.includes('deployment not found')) {
        return "❌ **Deployment Not Found**\n\nThe specified Azure OpenAI deployment could not be found. Please verify:\n- Deployment name: `slane-gpt-5`\n- Endpoint URL is correct\n- Deployment is active in Azure";
      } else if (errorMessage.includes('Rate limit exceeded')) {
        return "⏳ **Rate limit exceeded**\n\nToo many requests have been made. Please wait a moment and try again.";
      } else if (errorMessage.includes('CORS') || errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
        return "🌐 **Connection Issue**\n\nUnable to connect to Azure OpenAI after multiple attempts. This could be due to:\n\n**Common Causes:**\n• **Network connectivity**: Temporary internet connection issues\n• **Azure service**: Azure OpenAI may be experiencing high load\n• **Browser/Security**: Firewall or security software blocking requests\n• **Mobile network**: Cellular connections sometimes have restrictions\n\n**Try These Solutions:**\n1. **Refresh the page** and try again\n2. **Check your internet connection**\n3. **Switch networks** (WiFi ↔ Mobile data)\n4. **Wait 30 seconds** and retry\n5. **Disable VPN/Proxy** temporarily\n\n*If this persists, the issue is likely temporary network/service related.*";
      } else {
        return `❌ **Azure OpenAI Error**\n\n${errorMessage}\n\n*If this issue persists, please check the browser console for more details.*`;
      }
    }
  }
}

// For backward compatibility
export const AWSBedrockService = LlamaAIService;
export default LlamaAIService;
