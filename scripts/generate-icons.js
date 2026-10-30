// Node script to generate valid PNG icon files for PWA
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height) {
  // Simple PNG encoder in pure JS
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Signature
  const signature = Buffer.from([137, 80, 78, 70, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // color type: 6 = RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.46;
  const rInner = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rect / circle base
      const rx = Math.abs(dx) / (width * 0.42);
      const ry = Math.abs(dy) / (height * 0.42);
      const isCard = (rx * rx * rx * rx + ry * ry * ry * ry) <= 1.0;

      // Color scheme: Deep slate #0f172a with Emerald #10b981 center badge
      if (isCard) {
        if (dist <= rInner * 0.8) {
          // Emerald cloche center
          const isClocheDome = dy < 15 && dist <= rInner * 0.55 && dy > -rInner * 0.5;
          const isTray = dy >= 15 && dy <= 28 && Math.abs(dx) <= rInner * 0.6;
          const isHandle = dist <= rInner * 0.15 && dy < -rInner * 0.48;

          if (isClocheDome || isTray || isHandle) {
            // White / Gold cloche
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = isHandle ? 200 : 255;
            rawData[pxOffset + 2] = isHandle ? 50 : 255;
            rawData[pxOffset + 3] = 255;
          } else {
            // Emerald plate background
            rawData[pxOffset] = 16;
            rawData[pxOffset + 1] = 185;
            rawData[pxOffset + 2] = 129;
            rawData[pxOffset + 3] = 255;
          }
        } else {
          // Deep Slate background (#0f172a to #1e293b)
          const factor = (y / height);
          rawData[pxOffset] = Math.round(15 + factor * 15);
          rawData[pxOffset + 1] = Math.round(23 + factor * 25);
          rawData[pxOffset + 2] = Math.round(42 + factor * 40);
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Transparent outside rounded squircle
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512));
console.log('Successfully generated PWA icon assets!');
