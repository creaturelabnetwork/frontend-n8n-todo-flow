import { Todo, CreateTodoRequest, UpdateTodoRequest, DeleteTodoRequest, WebhookPayload } from '@/types/todo';

const WEBHOOK_URL = 'https://n8n-wvegawif.ap-southeast-1.clawcloudrun.com/webhook/c21aab4f-bc34-4ae6-89eb-dbe3c85eba41';

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