import { Todo, CreateTodoRequest, UpdateTodoRequest, DeleteTodoRequest, WebhookPayload } from '@/types/todo';

// const WEBHOOK_URL = 'https://n8n-wvegawif.ap-southeast-1.clawcloudrun.com/webhook/c21aab4f-bc34-4ae6-89eb-dbe3c85eba41';
// const WEBHOOK_URL = 'https://n8n-wvegawif.ap-southeast-1.clawcloudrun.com/webhook/396bbee5-cb31-43ba-822b-37ce829c3331';
const WEBHOOK_URL = 'https://n8n-1072648641147961392.rcf2.deploys.app/webhook/todos-crud';

const sendWebhook = async (payload: WebhookPayload): Promise<void> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending webhook:', error);
    throw error;
  }
};

export const todoService = {
  async readTodos(): Promise<Todo[]> {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'read',
          todo: {}
        }),
      });

      if (!response.ok) {
        throw new Error(`Read request failed with status: ${response.status}`);
      }

      const data = await response.json();
      // Handle the nested structure: [{ "todos": [...] }]
      if (Array.isArray(data) && data.length > 0 && data[0].todos) {
        return data[0].todos;
      }
      return [];
    } catch (error) {
      console.error('Error reading todos:', error);
      throw error;
    }
  },

  async createTodo(request: CreateTodoRequest): Promise<Todo> {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: request.title,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await sendWebhook({
      action: 'create',
      todo,
    });

    return todo;
  },

  async updateTodo(request: UpdateTodoRequest): Promise<Todo> {
    const updatedTodo: Partial<Todo> = {
      id: request.id,
      updatedAt: new Date(),
      ...(request.title !== undefined && { title: request.title }),
      ...(request.completed !== undefined && { completed: request.completed }),
    };

    await sendWebhook({
      action: 'update',
      todo: updatedTodo,
    });

    return updatedTodo as Todo;
  },

  async deleteTodo(request: DeleteTodoRequest): Promise<void> {
    await sendWebhook({
      action: 'delete',
      todo: { id: request.id },
    });
  },
};