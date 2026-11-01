# Spec Delta

## Purpose

Defines the everyday task-list experience so users can add, review, complete, filter, and remove tasks with clear feedback across screen sizes.

## ADDED Requirements

### Requirement: Task list reflects the user's tasks
The frontend SHALL present tasks with a clear distinction between active and completed items and provide meaningful loading, empty, and load-error states.

#### Scenario: Tasks are loading
- **WHEN** the task list is being retrieved
- **THEN** the user sees a loading state instead of a misleading empty list

#### Scenario: No tasks exist
- **WHEN** loading succeeds and there are no tasks
- **THEN** the user sees an empty state that explains how to add a task

#### Scenario: Task loading fails
- **WHEN** the task service cannot return the list
- **THEN** the user sees an error state and can retry loading

### Requirement: User can add a task
The frontend SHALL let the user submit a non-empty task title and show the created task after the service confirms success.

#### Scenario: Valid task is submitted
- **WHEN** the user submits a title containing non-whitespace characters
- **THEN** the task is created and appears in the list

#### Scenario: Blank task is submitted
- **WHEN** the title is empty or contains only whitespace
- **THEN** no task is created and the user receives appropriate form guidance

### Requirement: User can change task completion
The frontend SHALL let the user toggle a task between active and completed states and persist the new state through the task service.

#### Scenario: Active task is completed
- **WHEN** the user activates the completion control for an active task
- **THEN** the task is saved as completed and its completed state is visibly indicated

#### Scenario: Completed task is reactivated
- **WHEN** the user activates the completion control for a completed task
- **THEN** the task is saved as active and its active state is visibly indicated

### Requirement: User can filter tasks by completion state
The frontend SHALL provide All, Active, and Completed views that show only tasks matching the selected state.

#### Scenario: Active view is selected
- **WHEN** the user selects Active
- **THEN** only incomplete tasks are displayed

#### Scenario: Completed view is selected
- **WHEN** the user selects Completed
- **THEN** only completed tasks are displayed

#### Scenario: All view is selected
- **WHEN** the user selects All
- **THEN** both incomplete and completed tasks are displayed

### Requirement: User can remove a task
The frontend SHALL let the user remove a task and reflect the successful deletion in the visible list.

#### Scenario: Task deletion succeeds
- **WHEN** the user activates a task's delete control and deletion succeeds
- **THEN** the task is removed from the visible list

### Requirement: Task controls are accessible and responsive
The frontend SHALL expose task actions with descriptive accessible names, keyboard operation, visible focus, and a layout usable on narrow and wide viewports.

#### Scenario: User operates controls by keyboard
- **WHEN** the user navigates the task form, filters, and task actions with a keyboard
- **THEN** each control can be reached and activated and its purpose is announced accessibly

#### Scenario: Viewport becomes narrow
- **WHEN** the app is viewed on a narrow viewport
- **THEN** task content and controls remain readable and usable without horizontal page scrolling
