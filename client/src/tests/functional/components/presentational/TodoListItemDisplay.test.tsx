import React from 'react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';

// Components
import { TodoListItemDisplay } from '../../../../components/presentational/TodoList/TodoListItem/TodoListItemDisplay/TodoListItemDisplay';

type Props = React.ComponentProps<typeof TodoListItemDisplay>;

describe(`<TodoListItemDisplay/>`, () => {
  let baseProps: Props;

  beforeEach(() => {
    baseProps = {
      taskId: '1',
      taskName: 'Paint the wall',
      taskPriorityColor: 'red',
      taskDone: false,
      onTaskChangeStatus: vi.fn(),
      onSetEdit: vi.fn(),
      onDelete: vi.fn()
    };
  });

  const renderUI = (props: Partial<Props> = {}) => {
    return render(<TodoListItemDisplay {...baseProps} {...props} />);
  };

  afterEach(() => {
    cleanup();
  });

  it(`should display the crossed style on the task name when props.taskDone is true`, () => {
    // arrange
    const props: Partial<Props> = { taskDone: true, taskName: 'foo' };

    // act
    renderUI(props);
    const spanTaskName = screen.getByText('foo') as HTMLSpanElement;

    // assert
    expect(spanTaskName.classList.contains('itemDisplay__task--crossed')).toBe(true);
  });

  it(`should not display the crossed style on the task name when props.taskDone is false`, () => {
    // arrange
    const props: Partial<Props> = { taskDone: false, taskName: 'foo' };

    // act
    renderUI(props);
    const spanTaskName = screen.getByText('foo') as HTMLSpanElement;

    // assert
    expect(spanTaskName.classList.contains('itemDisplay__task--crossed')).toBe(false);
  });

  it(`should trigger onTaskChangeStatus when the checkbox changes`, () => {
    // arrange
    const props: Partial<Props> = { taskDone: false };

    renderUI(props);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

    // act
    fireEvent.click(checkbox);

    // assert
    expect(baseProps.onTaskChangeStatus).toHaveBeenCalledWith('1', true);
  });

  it(`should trigger onSetEdit when the edit button is clicked`, () => {
    // arrange
    renderUI();
    const buttonEdit = screen.getByText('Edit') as HTMLButtonElement;

    // act
    fireEvent.click(buttonEdit);

    // assert
    expect(baseProps.onSetEdit).toHaveBeenCalledTimes(1);
  });

  it(`should trigger onDelete when the edit button is clicked`, () => {
    // arrange
    renderUI();
    const buttonDelete = screen.getByText('Delete') as HTMLButtonElement;

    // act
    fireEvent.click(buttonDelete);

    // assert
    expect(baseProps.onDelete).toHaveBeenCalledTimes(1);
  });
});