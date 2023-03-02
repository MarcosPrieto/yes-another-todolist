/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { call, put, select } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';

// Store
import * as actions from '../actions';
import { RootState } from '../models/rootState.model';

// Models
import { Task } from '../../models/task.model';

// Constants
import { API_ENDPOINT } from '../../constants/configuration';

// Services
import { getAxiosApiInstance } from '../../services/axios.service';
import { getTaskList, TaskAction } from '../reducers/task.reducer';

/**
 * Fetch the tasks from the API
 */
export function* fetchTasksSaga() {
  yield put(actions.task.taskFetchStart());

  try {
    const apiEndpoint = `${API_ENDPOINT}/task`;

    const response: AxiosResponse<Task[]> =
      yield call(getAxiosApiInstance(apiEndpoint).get, '');

    yield put(actions.task.taskFetchSuccess(response.data));
  } catch (error) {
    yield put(actions.task.taskFetchError());
    console.log(error);
  }
}

export function* createTaskSaga(action: TaskAction) {
  yield put(actions.task.taskCreateStart());

  try {
    const apiEndpoint = `${API_ENDPOINT}/task`;

    const response: AxiosResponse<Task> =
      yield call(getAxiosApiInstance(apiEndpoint).post, '', action.editTask);

    yield put(actions.task.taskCreateSuccess(response.data));
  } catch (error) {
    yield put(actions.task.taskCreateError());
    console.log(error);
  }
}

export function* changeStatusSaga(action: TaskAction) {
  yield put(actions.task.taskChangeStatusStart());

  try {
    const apiEndpoint = `${API_ENDPOINT}/task`;

    yield call(getAxiosApiInstance(apiEndpoint).patch, `/${action.taskId}`, { done: action.done });

    yield put(actions.task.taskChangeStatusSuccess(action.taskId, action.done));
  } catch (error) {
    yield put(actions.task.taskChangeStatusError());
    console.log(error);
  }
}

export function* editTaskSaga(action: TaskAction) {
  yield put(actions.task.taskEditStart());

  try {
    const apiEndpoint = `${API_ENDPOINT}/task`;

    yield call(getAxiosApiInstance(apiEndpoint).patch, `/${action.editTask.id}`, action.editTask);

    yield put(actions.task.taskEditSuccess(action.editTask));
  } catch (error) {
    yield put(actions.task.taskEditError());
    console.log(error);
  }
}

export function* deleteTaskSaga(action: TaskAction) {
  yield put(actions.task.taskDeleteStart());

  try {
    const apiEndpoint = `${API_ENDPOINT}/task`;

    yield call(getAxiosApiInstance(apiEndpoint).delete, `/${action.taskId}`);

    yield put(actions.task.taskDeleteSuccess(action.taskId));
  } catch (error) {
    yield put(actions.task.taskDeleteError());
    console.log(error);
  }
}