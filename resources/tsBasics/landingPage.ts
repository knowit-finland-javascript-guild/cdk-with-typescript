/*
Generated with Copilot prompt:
I have a Nodejs endpoint that provides the following text:
Available endpoints are /example/fatArrow/ /example/map/ /example/filter/ /example/reduce/
Can you make that return an HTML document that provides actual links?

Then a second prompt was given to make it more stylish
*/

const endpoints = [
    "/example/fatArrow/",
    "/example/map/",
    "/example/filter/",
    "/example/reduce/",
];

export const landingPageHtml = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>API Endpoint Explorer</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(to right, #f0f4f8, #d9e2ec);
          margin: 0;
          padding: 40px;
          color: #333;
        }
        h1 {
          text-align: center;
          font-size: 2.5em;
          margin-bottom: 30px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 30px;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          margin: 15px 0;
        }
        a {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #007BFF;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        a:hover {
          color: #0056b3;
          transform: translateX(5px);
        }
        .icon {
          margin-right: 10px;
          font-size: 1.2em;
        }
      </style>
    </head>
    <body>
      <h1>🚀 API Endpoint Explorer</h1>
      <div class="container">
        <ul>
          ${endpoints
    .map(
        (endpoint) => `
            <li>
              <a href="${endpoint}">
                <span class="icon">🔗</span> ${endpoint}
              </a>
            </li>
          `
    )
    .join("")}
        </ul>
      </div>
    </body>
  </html>
  `;
