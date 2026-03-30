# Gravity Hub Setup Guide

Here is the complete implementation for your Personal Link Hub inspired by Google Anti-Gravity, built using React, Tailwind CSS, and Matter.js.

## Basic Setup Instructions

1. **Create a new Vite React project:**
Initialize a new project using Vite with the React template.

```bash
npm create vite@latest gravity-hub -- --template react
cd gravity-hub
```

2. **Install Dependencies:**
Install Tailwind CSS along with its peer dependencies, and `matter-js` for the physics engine.

```bash
npm install matter-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Configure Tailwind:**
Update your `tailwind.config.js` to process your React files:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
            ],
              theme: {
                  extend: {
                        fontFamily: {
                                sans: ['Inter', 'sans-serif'], // Optional: Modern font for a cleaner look
                                      }
                                          },
                                            },
                                              plugins: [],
                                              }
                                              ```

                                              4. **Add Tailwind Directives:**
                                              Replace the contents of `src/index.css` with the Tailwind base directives:

                                              ```css
                                              @tailwind base;
                                              @tailwind components;
                                              @tailwind utilities;

                                              body {
                                                margin: 0;
                                                  overflow: hidden; /* Prevent scrolling when physics take over */
                                                    font-family: 'Inter', system-ui, sans-serif;
                                                      background-color: #f8f9fa; /* Classic Google light gray background */
                                                      }
                                                      ```

                                                      5. **Start the Development Server:**
                                                      ```bash
                                                      npm run dev
                                                      ```

                                                      ---

                                                      ## The Code: App.jsx

                                                      Replace the contents of `src/App.jsx` with the code below. This code handles the neat grid layout by default and then injects Matter.js physics when you click "Toggle Gravity".
                                                      
