import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { combineReducers } from 'redux';
import { expectSaga } from 'redux-saga-test-plan';
import { toast } from 'react-toastify';

// Fixtures
import * as apiTasks from '../../fixtures/apiTasks.json';

// State
import { RootState } from '../../../store/models/rootState.model';
import * as taskReducer from '../../../store/reducers/task.reducer';
import {
  changeStatusSaga,
  createTaskSaga,
  fetchTasksSaga,
} from '../../../store/middleware/task.Saga';
import {
  TASK_CHANGE_STATUS,
  TASK_CHANGE_STATUS_ERROR,
  TASK_CHANGE_STATUS_START,
  TASK_CHANGE_STATUS_SUCCESS,
  TASK_CREATE,
  TASK_CREATE_ERROR,
  TASK_CREATE_START,
  TASK_CREATE_SUCCESS,
  TASK_FETCH_ERROR,
  TASK_FETCH_START,
  TASK_FETCH_SUCCESS,
} from '../../../constants/redux-action-types.constants';

// Models
import { Task } from '../../../models/task.model';


describe('redux saga - integration - task', () => {
  let mockInitialState: RootState;
  let mockAxios: MockAdapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rootReducer: any;

  beforeEach(() => {
    mockInitialState = {
      task: taskReducer.taskInitialState,
    } as RootState;

    rootReducer = combineReducers({
      task: taskReducer.taskReducer,
    });

    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockAxios.resetHistory();
  });

  describe('fetchTasksSaga', () => {
    it('should put fetchSucess when API response code is 200', (done) => {
      // arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiTasksFromJson: Task[] = (apiTasks as any).default;
      mockAxios.onGet().replyOnce(200, apiTasksFromJson);

      // act, assert
      return expectSaga(fetchTasksSaga)
        .withReducer(rootReducer)
        .withState({ ...mockInitialState })
        .put.actionType(TASK_FETCH_START)
        .put.actionType(TASK_FETCH_SUCCESS)
        .not.put.actionType(TASK_FETCH_ERROR)
        .run()
        .then((result) => {
          const stateTask = result.storeState.task as taskReducer.TaskState;
          expect(stateTask.taskList).toHaveLength(6);
          expect(stateTask.taskList[0].id).toBe('1');
          expect(stateTask.taskList[0].displayName).toBe('Paint the wall');
          done();
        });
    });

    it('should put fetchError when API response code is error', (done) => {
      // arrange
      const mockToastError = jest.spyOn(toast, 'error');

      mockAxios.onGet().networkErrorOnce();

      // act, assert
      return expectSaga(fetchTasksSaga)
        .withReducer(rootReducer)
        .withState({ ...mockInitialState })
        .put.actionType(TASK_FETCH_START)
        .not.put.actionType(TASK_FETCH_SUCCESS)
        .put.actionType(TASK_FETCH_ERROR)
        .run()
        .then(() => {
          expect(mockToastError).toHaveBeenCalledTimes(1);
          done();
        });
    });
  });

  describe('createTaskSaga', () => {
    it('should create a new Task when the API response code is 200', (done) => {
      // arrange
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiTasksFromJson: Task[] = (apiTasks as any).default;

      const newTask: Task = {
        id: 'new',
        displayName: 'foo',
        priority: 2,
        done: false,
      };

      mockAxios.onPost().replyOnce(200, { ...newTask, id: '7' });

      const modifiedMockInitialState: RootState = {
        ...mockInitialState,
        task: {
          ...mockInitialState.task,
          taskList: apiTasksFromJson,
        },
      };

      const taskAction = {
        type: TASK_CREATE, // any task, doesn't matter
        newTask,
      } as taskReducer.TaskAction;

      // act, assert
      return expectSaga(createTaskSaga, taskAction)
        .withReducer(rootReducer)
        .withState({ ...modifiedMockInitialState })
        .put.actionType(TASK_CREATE_START)
        .put.actionType(TASK_CREATE_SUCCESS)
        .not.put.actionType(TASK_CREATE_ERROR)
        .run()
        .then((result) => {
          const stateTask = result.storeState.task as taskReducer.TaskState;
          expect(stateTask.taskList).toHaveLength(7);
          expect(stateTask.taskList[6].id).toBe('7');
          expect(stateTask.taskList[6].displayName).toBe('foo');
          done();
        });
    });

    it('should put TASK_CREATE_ERROR when API response code is error', (done) => {
      // arrange
      const mockToastError = jest.spyOn(toast, 'error');

      mockAxios.onPost().networkErrorOnce();

      const taskAction = {
        type: TASK_CREATE, // any task, doesn't matter
        newTask: {},
      } as taskReducer.TaskAction;

      // act, assert
      return expectSaga(createTaskSaga, taskAction)
        .withReducer(rootReducer)
        .withState({ ...mockInitialState })
        .put.actionType(TASK_CREATE_START)
        .not.put.actionType(TASK_CREATE_SUCCESS)
        .put.actionType(TASK_CREATE_ERROR)
        .run()
        .then(() => {
          expect(mockToastError).toHaveBeenCalledTimes(1);
          done();
        });
    });
  });

  describe('changeStatusSaga', () => {
    it('should update a Task done value when the API response code is 200', (done) => {
      // arrange
      const mockToastSuccess = jest.spyOn(toast, 'success');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiTasksFromJson: Task[] = (apiTasks as any).default;

      mockAxios.onPatch().replyOnce(200);

      const modifiedMockInitialState: RootState = {
        ...mockInitialState,
        task: {
          ...mockInitialState.task,
          taskList: apiTasksFromJson,
        },
      };

      const taskAction = {
        type: TASK_CHANGE_STATUS, // any task, doesn't matter
        taskId: '1',
        done: true
      } as taskReducer.TaskAction;

      // act, assert
      return expectSaga(changeStatusSaga, taskAction)
        .withReducer(rootReducer)
        .withState({ ...modifiedMockInitialState })
        .put.actionType(TASK_CHANGE_STATUS_START)
        .put.actionType(TASK_CHANGE_STATUS_SUCCESS)
        .not.put.actionType(TASK_CHANGE_STATUS_ERROR)
        .run()
        .then((result) => {
          const stateTask = result.storeState.task as taskReducer.TaskState;
          expect(stateTask.taskList[0].id).toBe('1');
          expect(stateTask.taskList[0].done).toBe(true);
          expect(mockToastSuccess).toHaveBeenCalledWith(`Changed task 'Paint the wall' status to done`);
          done();
        });
    });

    it('should put TASK_CHANGE_STATUS_ERROR when API response code is error', (done) => {
      // arrange
      const mockToastError = jest.spyOn(toast, 'error');

      mockAxios.onPatch().networkErrorOnce();

      const taskAction = {
        type: TASK_CHANGE_STATUS, // any task, doesn't matter
        taskId: '1',
        done: true
      } as taskReducer.TaskAction;

      // act, assert
      return expectSaga(changeStatusSaga, taskAction)
        .withReducer(rootReducer)
        .withState({ ...mockInitialState })
        .put.actionType(TASK_CHANGE_STATUS_START)
        .not.put.actionType(TASK_CHANGE_STATUS_SUCCESS)
        .put.actionType(TASK_CHANGE_STATUS_ERROR)
        .run()
        .then(() => {
          expect(mockToastError).toHaveBeenCalledTimes(1);
          done();
        });
    });
  });
});
