# Bohemia Front-End

Bohemia is a modern web application built with **Angular 19** and **Tailwind CSS v4**, designed for managing events, showcasing image galleries, and facilitating ticket purchases with a bold, modern Brutalist aesthetic.

## 🚀 Features

- **Dynamic Event Discovery**: Browse upcoming events with a responsive, modern layout.
- **Ticket Purchasing Flow**: A seamless, multi-step checkout process for buying event tickets directly from the navbar.
- **Image Gallery**: View past event photos in an interactive masonry-style layout.
- **Admin Dashboard**: A protected area to securely manage events, locations, and ticket types.
- **Interactive Maps**: Integrated maps using Leaflet to display event locations.
- **Custom UI Architecture**: High-contrast elements, floating navigation bars, animated components, and a granular noise overlay.

## 🛠️ Tech Stack

- **Core Framework**: [Angular 19](https://angular.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/)
- **Testing**: Jasmine, Karma, and Cypress

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.11 or higher recommended)
- [Angular CLI](https://github.com/angular/angular-cli) installed globally:
  ```bash
  npm install -g @angular/cli
  ```

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd Bohemia_FE
   ```
2. Install the necessary dependencies:
   ```bash
   pnpm install
   ```

## 🚀 Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

## 🏗️ Build

Run `ng build` to build the project. The production-ready build artifacts will be stored in the `dist/bohemia-front-end/` directory.

## 🧪 Testing

- **Unit Tests**: Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
- **End-to-End Tests**: Run Cypress tests based on your configured testing environment.

## 🎨 Code Scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## 📚 Further Help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
