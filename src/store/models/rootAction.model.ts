import { TaskAction } from '../reducers/task.reducer';

export interface RootAction {
  todo: TaskAction;
}