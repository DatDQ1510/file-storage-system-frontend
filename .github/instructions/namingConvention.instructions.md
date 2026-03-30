# Frontend Coding Standards & Naming Conventions

You are an expert Frontend Engineer. When suggesting code, strictly adhere to the following naming conventions and architectural patterns for this React project.

## 1. TypeScript Types & Interfaces
- **Interfaces**: Must start with a capital `I` (PascalCase). Use for object definitions and component props.
  - Examples: `IUser`, `ISelection`, `IAppButtonProps`.
- **Types**: Must start with a capital `T` (PascalCase). Use for Union types, Intersection types, API responses, or primitive aliases.
  - Examples: `TStatus = 'idle' | 'loading'`, `TSelection`, `TUserResponse`.
- **Enums**: Use PascalCase and singular nouns.
  - Examples: `enum OrderStatus`, `enum UserRole`.

## 2. React Components & shadcn/ui
- **Component Names**: Use `PascalCase`.
  - Examples: `DashboardLayout`, `UserCard`.
- **shadcn/ui**: Maintain original shadcn naming for base components (e.g., `Button`, `Dialog`). When wrapping them for specific features, use descriptive names.
- **File Naming**: 
  - Component files: `PascalCase.tsx`.
  - Folders: `kebab-case`.

## 3. State Management (Zustand)
- **Store Hook Name**: Use the format `use[Name]Store`.
  - Examples: `useAuthStore`, `useSelectionStore`.
- **State Properties**: Use `camelCase`.
- **Actions**: Start with a verb describing the mutation.
  - Examples: `setSelection`, `fetchUserList`, `resetStore`.
- **File Naming**: `use-[name]-store.ts` (kebab-case).

## 4. API & Axios Interceptors
- **Service Functions**: Use descriptive verbs (get, post, put, delete, update).
  - Examples: `getProducts()`, `updateUserSelection()`.
- **Axios Instance**: Always use the configured axios instance from the interceptor (usually named `api` or `client`) instead of the default `axios` package.
- **File Naming**: `[module]-service.ts`. Example: `auth-service.ts`.

## 5. Custom Hooks & Utils
- **Hooks**: Must start with `use`.
  - Examples: `useDebounce`, `useLocalStorage`.
  - File name: `use-[name].ts`.
- **Booleans**: Must have a prefix indicating state (is, has, should, can).
  - Examples: `isLoading`, `hasPermission`, `isSelectionActive`.
- **Constants**: Use `UPPER_SNAKE_CASE` for global configuration values.
  - Examples: `API_TIMEOUT`, `MAX_SELECTION_LIMIT`.

## 6. Directory Structure Reference
- `src/components/ui`: shadcn/ui base components.
- `src/components/common`: Shared/Global components.
- `src/components/[feature]`: Feature-specific components.
- `src/constants`: Global constants and enums.
- `src/pages`: Page components.
- `src/helpers/validators`: Validation functions for forms and inputs. 
- `src/hooks`: Custom React hooks.
- `src/lib`: Utility functions and API clients.
- `src/services`: Axios method and API service functions.
- `src/stores`: Zustand store definitions.
- `src/types`: Centralized `I` interfaces and `T` types.

## 7. Event Handling
- Event handler functions should be prefixed with `handle`.
  - Examples: `handleSelectionChange`, `handleSubmit`.
- Prop-based event handlers should be prefixed with `on`.
  - Examples: `onSelect`, `onChange`.

## 8. Clean Code & Performance
- **Logic Separation**: Keep components lean. Move complex logic to custom hooks and API calls to services.
- **State Management**: Use Zustand actions for mutations. Do not mutate state directly inside components.
- **Performance**: Always wrap expensive computations in `useMemo` and functions passed to children in `useCallback`.
- **Error Handling**: Use the global axios instance. Wrap async calls in try-catch and display errors using the `toast` component.
- **Conditional Rendering**: Prefer early returns or ternary operators over complex nested logical `&&` if possible.
- **Shadcn/UI**: Use existing UI components. Do not reinvent the wheel for buttons, inputs, or modals.