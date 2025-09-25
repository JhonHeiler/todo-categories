export interface Task {
  id: string;
  title: string;
  done: boolean;
  categoryId?: string | null;
  createdAt: number;
}
