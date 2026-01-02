# Qwen Documentation for vidioo Project

## Project Overview

vidioo is a Persian video streaming application built with Vue.js. The application provides features such as video watching, channel subscriptions, user preferences, history tracking, and more. It uses modern web technologies including Vite, Vue 3, UnoCSS, and PWA capabilities.

## Project Structure

- `src/` - Main source code
  - `components/` - Vue components
  - `router/` - Vue Router configuration
  - `utils/` - Utility functions
  - `locales/` - Localization files
- `public/` - Static assets
- `tests/` - Test files (added for Vitest)

## Testing Framework

The project uses **Vitest** as the testing framework, integrated with:

- **@vue/test-utils** - Vue-specific testing utilities
- **@testing-library/vue** - Testing library for Vue
- **jsdom** - DOM implementation for testing
- **@testing-library/jest-dom** - Jest DOM matchers

### Test Scripts

The following npm scripts are available:

- `npm test` or `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Run Vitest with UI
- `npm run test:coverage` - Run tests with coverage report

### Test File Locations

- Test files should be placed in the `tests/unit/` directory
- Component tests follow the pattern: `ComponentName.test.js`
- Utility tests follow the pattern: `utilityName.test.js`

### Writing Tests

When adding new functionality to the project, Qwen should:

1. Create appropriate test files in the `tests/` directory
2. Follow the existing test patterns in the project
3. Ensure all new features have adequate test coverage
4. Run tests before committing changes using `npm run test:run`

### Mocking in Tests

The project includes necessary mocks for:
- Vue Router functionality
- PWA virtual modules
- Browser APIs like `window.matchMedia`

## Running Tests

When making changes to the codebase, Qwen should run tests to ensure functionality remains intact:

```bash
# Run all tests
npm run test:run

# Run tests with coverage
npm run test:coverage

# Watch mode during development
npm test
```

## Testing Workflow for Qwen

When making changes to the codebase, Qwen should follow this workflow:

1. **Before making changes**: Run `npm run test:run` to ensure all existing tests pass
2. **During development**: Use `npm test` to run tests in watch mode
3. **After implementing changes**:
   - Add new tests for new functionality
   - Run `npm run test:run` to ensure all tests pass
   - Run `npm run test:coverage` to check coverage hasn't decreased significantly
4. **Before committing**: Always run `npm run test:run` to verify all tests pass

## Test Categories

The project includes different types of tests:
- **Unit tests**: Test individual components and utilities (`tests/unit/`)
- **Integration tests**: Test how components work together (to be added as needed)
- **End-to-end tests**: Test user flows (to be added as needed)

## Comprehensive Testing Approach

For thorough testing of the application, Qwen should consider testing:

### Component Testing
- **UI Components**: Test rendering, props, events, and user interactions
- **State Management**: Test how components handle different states and data
- **Lifecycle Methods**: Test mounted, updated, and unmounted hooks if they contain important logic

### Common Test Scenarios to Cover
- Component renders correctly with different props
- Events are emitted properly
- User interactions (clicks, input changes, etc.) work as expected
- Component behaves correctly in different states (loading, error, empty, etc.)
- Component handles edge cases appropriately

### Testing Best Practices
- Write tests that are fast, isolated, and deterministic
- Use descriptive test names that explain the expected behavior
- Test both positive and negative scenarios
- Mock external dependencies like APIs and browser APIs
- Ensure test coverage for critical user flows

### Current Test Coverage
The project now includes tests for the following components:
- **App.vue**: Main application component
- **ToastComponent.vue**: Toast notification component
- **Sidebar.vue**: Sidebar navigation component
- **NavBar.vue**: Navigation bar component
- **SearchForm.vue**: Search form component
- **WatchVideo.vue**: Video playback component
- **And ALL components**: Comprehensive test coverage has been added for all components in the src/components directory

These tests verify rendering, user interactions, prop handling, and event emissions for critical UI components.

### Test Status
Currently, the project has 70 passing tests, with comprehensive coverage of all major components. The testing framework is fully functional and ready for additional tests to be added as the application grows.

## Important Notes for Qwen

- When modifying Vue components, ensure they are properly tested
- When adding new dependencies, consider their impact on testability
- When changing core functionality, update or add corresponding tests
- The project uses Persian (RTL) localization, which should be maintained in tests
- Vue's reactivity system and lifecycle hooks should be considered in component tests
- When fixing bugs, add regression tests to prevent the bug from reoccurring
- For components that use browser APIs (localStorage, window.matchMedia, etc.), ensure proper mocking in tests
- Consider testing both mobile and desktop behaviors where applicable
- When adding new component files, always create corresponding test files in the tests/unit/ directory
- When adding new utility functions or services, create appropriate unit tests for them
- When adding new feature files, ensure they are covered by tests to maintain high test coverage