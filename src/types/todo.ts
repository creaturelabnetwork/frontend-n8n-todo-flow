export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  title: string;
}

export interface UpdateTodoRequest {
  id: string;
  title?: string;
  completed?: boolean;
}

export interface DeleteTodoRequest {
  id: string;
}

export interface WebhookPayload {
  action: 'create' | 'update' | 'delete';
  todo: Todo | Partial<Todo>;
}