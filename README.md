# Futoshiki

## About

Futoshiki is a puzzle game, similar to Sudoku. The objective is to fill cells with digits while honouring inequality constraints. For details, select "Games rules" from the in-game menu.

<a href="https://bkoelman.github.io/Futoshiki/">
<kbd>
  <img src="https://github.com/bkoelman/Futoshiki/blob/master/futoshiki-demo.png">
</kbd>
</a>

[Click here to play!](https://bkoelman.github.io/Futoshiki/)

This open-source project was created as a learning experience using [Angular 6](https://angular.io/), [TypeScript 3](https://www.typescriptlang.org/) and [Bootstrap 4](https://getbootstrap.com/).

## Feedback
Feel welcome to report bugs, feature requests and/or remarks in the [Issue tracker](https://github.com/bkoelman/Futoshiki/issues).

## Building the code
Please install the next prerequisites if you do not have them on your system already:
* [Visual Studio Code](https://code.visualstudio.com/) with extensions:
  * Debugger for Chrome
  * ESLint
  * TSLint
  * CSS Formatter
  * Prettier
* [Node.js (LTS version)](https://nodejs.org/en/)
* [Angular](https://angular.io/guide/quickstart)
    ```
    npm install -g @angular/cli@6
    ```
* [angular-cli-ghpages](https://alligator.io/angular/deploying-angular-app-github-pages/)
    ```
    npm install -g angular-cli-ghpages
    ```

After fetching the repo for the first time, run `npm install` to download all package dependencies.
Next, to build and debug the application in Chrome, run `npm start` and press F5 (or navigate manually to `http://localhost:4200/`).
The app will automatically reload if you change any of the source files.

Run `npm run deploy` to create a production build and deploy it to GitHub Pages.

## Running tests
* Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
* Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
