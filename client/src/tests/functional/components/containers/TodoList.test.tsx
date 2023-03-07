import React from 'react';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { render, cleanup, screen, fireEvent, within, waitFor } from '@testing-library/react';

// Models
import { Task } from '../../../../models/task.model';

// Redux
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import * as taskReducer from '../../../../store/reducers/task.reducer';
import { TASK_ADD, TASK_CHANGE_STATUS, TASK_DELETE, TASK_UPDATE } from '../../../../constants/redux-action-types.constants';

// Components
import ConnectedTodoList, { TodoList } from '../../../../components/containers/TodoList/TodoList';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

type Props = React.ComponentProps<typeof TodoList>;

describe('TodoList', () => {
  let baseProps: Props;

  beforeEach(() => {
    baseProps = {
      initialTaskList: [
        { id: '1', displayName: 'Paint the wall', priority: 3, done: false },
        { id: '2', displayName: 'Create a todoList demo application', priority: 0, done: true },
        { id: '3', displayName: 'Learn Kubernetes', priority: 2, done: false },
        { id: '4', displayName: 'Buy an ukelele', priority: 0, done: true },
        { id: '5', displayName: 'Learn to play ukelele', priority: 1, done: false },
        { id: '6', displayName: 'Sell ukelele', priority: 1, done: true },
      ],
      onFetchTasks: vi.fn(),
      onChangeTaskStatus: vi.fn(),
      onDeleteTask: vi.fn(),
      onAddTask: vi.fn(),
      onUpdateTask: vi.fn()
    };
  });

  const renderUI = (props: Partial<Props> = {}) => {
    return render(<TodoList {...baseProps} {...props} />);
  };

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  describe('<TodoList/>', () => {

    it('should display pending tasks sorted by priority', async () => {
      // arrange, act
      renderUI();

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);

      const todoItemList = await pendingSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      // assert
      expect(todoItemList[0].textContent).toContain('Learn to play ukelele');
      expect(todoItemList[1].textContent).toContain('Learn Kubernetes');
      expect(todoItemList[2].textContent).toContain('Paint the wall');
    });

    it('should display completed tasks sorted by priority', async () => {
      // arrange
      renderUI();

      const completedSection = within(screen.getByText(/Completed/i).closest('section') as HTMLDivElement);

      const header = completedSection.getByText(/Completed/i) satisfies HTMLHeadingElement;

      // act
      fireEvent.click(header);

      const todoItemList = await completedSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      // assert
      expect(todoItemList[0].textContent).toContain('Create a todoList demo application');
      expect(todoItemList[1].textContent).toContain('Buy an ukelele');
      expect(todoItemList[2].textContent).toContain('Sell ukelele');
    });

    it('should move a task from pending to completed section when checked', async () => {
      // arrange
      renderUI();

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);
      const pendingSectionHeader = pendingSection.getByText(/Pending/i).closest('h2') as HTMLHeadingElement;

      const completedSection = within(screen.getByText(/Completed/i).closest('section') as HTMLDivElement);
      const completedSectionHeader = completedSection.getByText(/Completed/i).closest('h2') as HTMLHeadingElement;

      expect(completedSectionHeader.textContent).toBe('Completed (3)');
      expect(pendingSectionHeader.textContent).toBe('Pending (3)');

      const pendingTasks = await pendingSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      expect(pendingTasks[0].textContent).toContain('Learn to play ukelele');

      const checkBox = within(pendingTasks[0]).getByRole('checkbox') satisfies HTMLInputElement;

      // act
      fireEvent.click(checkBox);

      fireEvent.click(completedSectionHeader);

      // assert
      await waitFor(() => expect(pendingSection.queryByText('Learn to play ukelele')).toBeNull());
      expect(completedSection.queryByText('Learn to play ukelele')).toBeTruthy();
      expect(completedSectionHeader.textContent).toBe('Completed (4)');
      expect(pendingSectionHeader.textContent).toBe('Pending (2)');
    });

    it('should move a task from completed to pending section when checked', async () => {
      // arrange
      renderUI();

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);
      const pendingSectionHeader = pendingSection.getByText(/Pending/i).closest('h2') as HTMLHeadingElement;

      const completedSection = within(screen.getByText(/Completed/i).closest('section') as HTMLDivElement);
      const completedSectionHeader = completedSection.getByText(/Completed/i).closest('h2') as HTMLHeadingElement;

      expect(completedSectionHeader.textContent).toBe('Completed (3)');
      expect(pendingSectionHeader.textContent).toBe('Pending (3)');

      fireEvent.click(completedSectionHeader);

      const completedTasks = await completedSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      expect(completedTasks[1].textContent).toContain('Buy an ukelele');

      const checkBox = within(completedTasks[1]).getByRole('checkbox') satisfies HTMLInputElement;

      // act
      fireEvent.click(checkBox);

      // assert
      expect(completedSection.queryByText('Buy an ukelele')).toBeNull();
      expect(pendingSection.queryByText('Buy an ukelele')).toBeTruthy();
      expect(completedSectionHeader.textContent).toBe('Completed (2)');
      expect(pendingSectionHeader.textContent).toBe('Pending (4)');
    });

    it('should fetch the task list the first time the component is loaded', async () => {
      // arrange
      // act
      renderUI();

      // assert
      expect(baseProps.onFetchTasks).toHaveBeenCalledTimes(1);
    });

    it('should render a TodoListItemEdit when click on Edit in a task', async () => {
      // arrange
      renderUI();

      const todoItemDetailsComponents = await screen.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];
      const todoItemEditComponents = await screen.findAllByTestId('todoItemEdit') satisfies HTMLDivElement[];

      // assert
      expect(todoItemDetailsComponents).toHaveLength(3);

      const buttonEdit = within(todoItemDetailsComponents[0]).getByTitle('Edit') satisfies HTMLButtonElement;

      // act
      fireEvent.click(buttonEdit);

      // assert
      expect(screen.getAllByTestId('todoItemDisplay')).toHaveLength(2);
      expect(todoItemEditComponents).toHaveLength(1);
    });

    it('should trigger onTaskChangeStatus when a task is marked as done/undone', async () => {
      // arrange
      renderUI();

      const todoItemDetailsComponents = await screen.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      const checkBox = within(todoItemDetailsComponents[0]).getByRole('checkbox') satisfies HTMLInputElement;

      // act
      fireEvent.click(checkBox);

      // assert
      expect(baseProps.onChangeTaskStatus).toHaveBeenCalledWith('5', true);
    });

    it('should trigger onDelete when button delete is clicked on TodoListItemDisplay', async () => {
      // arrange
      renderUI();

      const todoItemDetailsComponents = await screen.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      const buttonDelete = within(todoItemDetailsComponents[0]).getByTitle('Delete') satisfies HTMLButtonElement;

      // act
      buttonDelete.click();

      // assert
      expect(baseProps.onDeleteTask).toHaveBeenCalledWith('5');
    });

    it('should trigger onAdd when a task is created', async () => {
      // arrange
      renderUI();

      const editSection = screen.getByText(/Create/i).closest('section') as HTMLDivElement;

      const input = within(editSection).getByRole('textbox') satisfies HTMLInputElement;

      // act
      userEvent.type(input, 'New task name{enter}');

      // assert
      await waitFor(() => expect(baseProps.onAddTask).toHaveBeenCalledWith(expect.objectContaining({ displayName: 'New task name' })));
    });

    it('should trigger onUpdate when button Save is clicked on TodoListItemEdit', async () => {
      // arrange
      renderUI();

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);

      const todoItemDetailsComponents = await pendingSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      const buttonEdit = within(todoItemDetailsComponents[0]).getByTitle('Edit') satisfies HTMLButtonElement;

      userEvent.click(buttonEdit);

      const todoItemEditComponents = await pendingSection.findAllByTestId('todoItemEdit') satisfies HTMLDivElement[];

      const input = within(todoItemEditComponents[0]).getByRole('textbox') satisfies HTMLInputElement;

      // act
      userEvent.clear(input);
      userEvent.type(input, 'New task name{enter}');

      // assert
      await waitFor(() => expect(baseProps.onUpdateTask).toHaveBeenCalledWith(expect.objectContaining({ id: '5' })));
    });

    it('should render a TodoListItemDisplay instead of TodoListItemEdit when Cancel button is clicked', async () => {
      // arrange
      renderUI();

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);

      const todoItemDetailsComponents = await pendingSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      const buttonEdit = within(todoItemDetailsComponents[0]).getByTitle('Edit') satisfies HTMLButtonElement;

      fireEvent.click(buttonEdit);

      const todoItemEditComponents = await pendingSection.findAllByTestId('todoItemEdit') satisfies HTMLDivElement[];

      await waitFor(() => expect(todoItemEditComponents).toHaveLength(1));

      const buttonCancel = within(todoItemEditComponents[0]).getByRole('button', { name: /Cancel/}) satisfies HTMLButtonElement;

      // act
      fireEvent.click(buttonCancel);

      // assert
      await waitFor(() => expect(pendingSection.queryAllByTestId('todoItemEdit')).toHaveLength(0));
    });
  });

  describe('ConnectedTodoList', () => {
    let store: MockStoreEnhanced<unknown, unknown>;
    const middlewares = [createSagaMiddleware()];
    const mockStore = configureStore(middlewares);

    const renderUI = (partialState: Partial<taskReducer.TaskState> = {}) => {
      store = mockStore({
        task: { ...taskReducer, ...partialState },
      });
      store.dispatch = vi.fn();

      const component = <Provider store={store}>
        <ConnectedTodoList />
      </Provider>;

      return render(component);
    };

    it('should call TASK_ADD when the save button is clicked creating a task', () => {
      // arrange
      vi.mock('uuid', () => ({ v4: () => '123456789' }));

      const storeProps: Partial<taskReducer.TaskState> = {
        taskList: baseProps.initialTaskList,
      };

      renderUI(storeProps);

      const { getByRole } = within(screen.getByText('Create task').closest('section') as HTMLDivElement);

      const todoNameInput = getByRole('textbox') satisfies HTMLInputElement;
      fireEvent.change(todoNameInput, { target: { value: 'foo' } });

      const saveButton = getByRole('button', { name: /Save/i }) satisfies HTMLButtonElement;

      // act
      fireEvent.click(saveButton);

      const createdTask: Task = {
        id: '123456789',
        displayName: 'foo',
        priority: 2,
        done: false,
      };

      // assert
      expect(store.dispatch).toHaveBeenCalledWith({
        type: TASK_ADD,
        editTask: createdTask,
      } satisfies taskReducer.TaskActionPartial);
    });

    it('should call TASK_UPDATE when the save button is clicked updating a task', async () => {
      // arrange
      const storeProps: Partial<taskReducer.TaskState> = {
        taskList: baseProps.initialTaskList,
      };

      renderUI(storeProps);

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);

      const todoItemDetailsComponents = await pendingSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      const buttonEdit = within(todoItemDetailsComponents[0]).getByTitle('Edit') satisfies HTMLButtonElement;

      fireEvent.click(buttonEdit);

      const todoItemEditComponents = await pendingSection.findAllByTestId('todoItemEdit') satisfies HTMLDivElement[];

      const todoNameInput = within(todoItemEditComponents[0]).getByRole('textbox') satisfies HTMLInputElement;
      fireEvent.change(todoNameInput, { target: { value: 'foo' } });

      const saveButton = within(todoItemEditComponents[0]).getByRole('button', { name: /Save/i }) satisfies HTMLButtonElement;

      // act
      fireEvent.click(saveButton);

      const createdTask: Task = {
        id: '5',
        displayName: 'foo',
        priority: 1,
        done: false,
      };

      // assert
      expect(store.dispatch).toHaveBeenCalledWith({
        type: TASK_UPDATE,
        editTask: createdTask,
      } satisfies taskReducer.TaskActionPartial);
    });

    it('should call TASK_DELETE when the delete button is clicked', async () => {
      // arrange
      const storeProps: Partial<taskReducer.TaskState> = {
        taskList: baseProps.initialTaskList,
      };

      renderUI(storeProps);

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);

      const todoItemDetailsComponents = await pendingSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      const buttonDelete = within(todoItemDetailsComponents[0]).getByTitle('Delete') satisfies HTMLButtonElement;

      // act
      fireEvent.click(buttonDelete);

      // assert
      expect(store.dispatch).toHaveBeenCalledWith({
        type: TASK_DELETE,
        taskId: '5',
      } satisfies taskReducer.TaskActionPartial);
    });

    it('should call TASK_CHANGE_STATUS when clicking on the task checkbox', async () => {
      // arrange
      const storeProps: Partial<taskReducer.TaskState> = {
        taskList: baseProps.initialTaskList,
      };

      renderUI(storeProps);

      const pendingSection = within(screen.getByText(/Pending/i).closest('section') as HTMLDivElement);

      const todoItemDetailsComponents = await pendingSection.findAllByTestId('todoItemDisplay') satisfies HTMLDivElement[];

      const checkbox = within(todoItemDetailsComponents[0]).getByRole('checkbox') satisfies HTMLButtonElement;

      // act
      fireEvent.click(checkbox);

      // assert
      expect(store.dispatch).toHaveBeenCalledWith({
        type: TASK_CHANGE_STATUS,
        taskId: '5',
        done: true,
      } satisfies taskReducer.TaskActionPartial);
    });
  });
});
