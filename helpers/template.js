const promo = (content) => {
    let ctaTag = content.hasLink ? `<a href="${content.url}" class="cta-button">${content.cta}</a>` : `<small></small>`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PartiXpender | Newsletter</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      background-color: #ffffff;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }
    h1 {
      color: #333333;
      text-align: center;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
      color: #555555;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background-color: #28a745;
      color: #ffffff;
      padding: 12px 24px;
      text-align: center;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777777;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h1>${content.title}</h1>
    <p>${content.body}</p>
    <p>
      ${ctaTag}
    </p>
    <div class="footer">
      <p>If you no longer wish to receive these emails, you can <a href="#">unsubscribe</a> at any time.</p>
      <p>&copy; 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}

module.exports = { promo }