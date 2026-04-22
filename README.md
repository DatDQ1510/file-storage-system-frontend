    # React + TypeScript + Vite Starter

Project setup includes:

- Zustand for state management
- Axios for API calls with global interceptors
- shadcn/ui + Tailwind CSS for reusable UI

## Run

```bash
npm install
npm run dev
```

## Structure

## Add shadcn components

```bash
npx shadcn@latest add button
```

## GitHub Copilot CLI Setup (Windows PowerShell)

Use this project with the new GitHub Copilot CLI through `gh copilot`.

### 1. Install GitHub CLI

```powershell
winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements
```

### 2. Authenticate GitHub CLI

```powershell
gh auth login --web
gh auth status
```

### 3. Install Copilot CLI binary (first run)

```powershell
gh copilot -- --help
```

On first run, accept installation when prompted.

### 4. Login Copilot CLI

```powershell
gh copilot -- login
```

### 5. Frontend daily usage

Run from this frontend folder.

```powershell
# Suggest commands for Vite/React workflow
gh copilot -- -p "I need commands to install deps and run this Vite app" --allow-tool "shell(npm:*)"

# Explain a command before running it
gh copilot -- -p "Explain what this command does: npm run build" --allow-tool "shell"

# Start an interactive coding session in this repo
gh copilot
```

### 6. Safe defaults

- Prefer `--allow-tool` with narrow scope instead of broad auto-approval.
- Avoid `--allow-all` and `--yolo` unless you are in a disposable environment.
- Review suggested commands before execution.

### 7. Troubleshooting

- `gh: command not found` in current terminal:
    - Reopen terminal, or refresh PATH in current session:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
```

- Not logged in:

```powershell
gh auth status
gh auth login --web
```

- Remove downloaded Copilot CLI (from `gh` wrapper cache):

```powershell
gh copilot --remove
```
