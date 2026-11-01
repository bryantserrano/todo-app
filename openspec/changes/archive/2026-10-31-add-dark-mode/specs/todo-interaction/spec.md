# Spec Delta

## ADDED Requirements

### Requirement: Theme follows device preference until the user chooses
The frontend SHALL use the device's light or dark color preference when no user theme choice has been saved, and SHALL update the appearance when that device preference changes.

#### Scenario: No saved choice and device prefers dark
- **WHEN** the app starts without a saved theme choice and the device prefers dark appearance
- **THEN** the app is displayed in dark appearance

#### Scenario: No saved choice and device prefers light
- **WHEN** the app starts without a saved theme choice and the device prefers light appearance
- **THEN** the app is displayed in light appearance

#### Scenario: Device preference changes without a saved choice
- **WHEN** the device color preference changes while the user has no saved theme choice
- **THEN** the app updates to match the new device preference

### Requirement: User can choose and retain an appearance
The frontend SHALL provide an accessible control to switch between light and dark appearance and SHALL retain the user's explicit choice across app visits until the user changes it.

#### Scenario: User selects a theme
- **WHEN** the user activates the theme control to select light or dark appearance
- **THEN** the app immediately applies that appearance and saves the choice

#### Scenario: App starts with a saved choice
- **WHEN** the app starts with a saved light or dark choice
- **THEN** the app applies the saved appearance regardless of the device preference

#### Scenario: Theme control reflects the current appearance
- **WHEN** the app is displayed in light or dark appearance
- **THEN** the theme control's visible label and icon identify the current appearance

#### Scenario: User operates the theme control by keyboard
- **WHEN** the user navigates to and activates the theme control using a keyboard
- **THEN** the control can be focused and activated and its purpose and current state are available accessibly
