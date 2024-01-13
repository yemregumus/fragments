# Fragments Back-End Microservice

This is the Fragments back-end microservice project. This project serves as the foundation for my work in the upcoming weeks. Below instructions to set up development environment, run the server, and leverage various scripts.

### Software to Install

I had to make sure to have the following software installed and working on my development machine:

- Node.js (LTS version)
- VSCode with the following extensions:
  - ESLint
  - Prettier - Code Formatter
  - Code Spell Checker
- Git CLI
- Curl
- WSL2 and Windows Terminal (for Windows)

### API Server Setup

1. I created a private GitHub repo named `fragments`.
2. I cloned `fragments` repo to my local machine.
3. Then navigated to the cloned repo: `cd fragments`.

### NPM Setup

4. Initialize the project as an npm project: `npm init -y`.
5. Open the project in VSCode: `code .`.
6. Modify the `package.json` file as described in the instructions.
7. Run `npm install` to validate and install dependencies.
8. Commit the changes to git: `git add package.json package-lock.json` and `git commit -m "Initial npm setup"`.

### Prettier Setup

9. Install Prettier as a Development Dependency: `npm install --save-dev --save-exact prettier`.
10. Create `.prettierrc` and `.prettierignore` files as described in the instructions.
11. Install the Prettier - Code Formatter VSCode Extension.
12. Create a `.vscode/settings.json` file with the provided settings.
13. Commit the changes to git: `git add .prettierrc .prettierignore .vscode/settings.json` and `git commit -m "Add prettier"`.

### ESLint Setup

14. Install ESLint: `npm install --save-dev eslint`.
15. Run `npx eslint --init` and configure ESLint as described in the instructions.
16. Install the ESLint VSCode Extension.
17. Add a lint script to `package.json`.
18. Run ESLint and commit the changes to git: `git add .eslintrc.js package-lock.json package.json` and `git commit -m "Add eslint"`.

### Structured Logging and Pino Setup

19. Create a `src/logger.js` file with the provided content.
20. Run `git add src/logger.js` and `git commit -m "Add pino logger"`.

### Express App Setup

21. Install required packages for Express: `npm install --save express cors helmet compression`.
22. Create a `src/app.js` file with the provided content.
23. Run `git add src/app.js` and `git commit -m "Initial work on express app"`.

### Express Server Setup

24. Install the `stoppable` package: `npm install --save stoppable`.
25. Create a `src/server.js` file with the provided content.
26. Run `git add src/server.js` and `git commit -m "Initial work on express server"`.

---

## NPM Scripts

Run ESLint to check for code style and potential issues:

npm run lint

Run the server in production mode:

npm start

Run the server with nodemon, watching for changes:

npm run dev

Run the server with nodemon and enable the Node.js inspector on port 9229:

npm run debug
