# QR Code Generator

A free, browser-based QR code maker for URLs and text.

**Live site:** https://arnavgiri.github.io/qr-code-generator/

## Features

- QR creation happens locally in the browser; no external encoding API, account or server upload.
- Supports Unicode text via UTF-8 encoding.
- Custom foreground/background colors and error-correction levels.
- Optional quiet zone, recommended for reliable scanning.
- Export high-resolution PNG (512, 1024 or 2048 px) or scalable SVG.
- Copy the generated PNG to the clipboard when supported by the browser.
- Responsive layout with a live preview and error messages.

## Third-party software

The bundled `qr-engine.js` is the open-source `qrcode-generator` JavaScript implementation, version 2.0.4, by Kazuhiko Arase. Copyright (c) 2009 Kazuhiko Arase. Licensed under the MIT License; see `LICENSE`.

No npm install, external CDN or web service is required to generate QR codes.

## Project

Built by Arnav Giri. Source: https://github.com/arnavgiri/arnavgiri.github.io/tree/main/qr-code-generator
