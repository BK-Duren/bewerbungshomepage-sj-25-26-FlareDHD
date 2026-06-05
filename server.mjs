// server.mjs
// where your node app starts

// init project
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { configDotenv } from "dotenv";
import { readFile, writeFile } from 'fs/promises';
import MarkdownIt from 'markdown-it';
configDotenv();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const markdown = new MarkdownIt({ html: true, linkify: true, typographer: true });

// templating engine setup
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Alle Seiten auf HTTPS umleiten.
function checkHttps(req, res, next) {
  // protocol check, if http, redirect to https
  const protoHeader = req.get("X-Forwarded-Proto");
  const proto = (protoHeader || req.protocol || '').toString();
  // local development never redirect
  if (process.env.NODE_ENV === 'development' ||
      req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
    return next();
  }
  if (proto.includes("https")) {
    return next();
  }
  res.redirect("https://" + req.hostname + req.url);
}

app.all("*", checkHttps);

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// Die statischen Seiten in public, assets und content werden als "statisch" definiert. So können Sie direkt adressiert werden.
app.use(express.static("public"));
app.use(express.static("assets"));
app.use(express.static("content"));

// helper to load content by name (prefers .html, then .md, falls back to .json)
async function loadContent(name) {
  const htmlPath = `./content/${name}.html`;
  const mdPath = `./content/${name}.md`;

  try {
    let content = await readFile(htmlPath, 'utf8');
    // when loading header, automatically append navi if header doesn't define one
    if (name === 'header') {
      try {
        const navi = await readFile(`./content/navi.html`, 'utf8');
        if (navi && !/\<nav[\s>]/i.test(content)) {
          // insert nav just before closing </header> if present
          if (/\<\/header\s*>/i.test(content)) {
            content = content.replace(/(\<\/header\s*>)/i, `${navi}\n$1`);
          } else {
            content = content + '\n' + navi;
          }
        }
      } catch {}
    }
    return content;
  } catch (e) {
    try {
      const markdownText = await readFile(mdPath, 'utf8');
      return `<div class="markdown-body">${markdown.render(markdownText)}</div>`;
    } catch (e2) {
      const jsonPath = `./content/${name}.json`;
      try {
        const txt = await readFile(jsonPath, 'utf8');
        return JSON.parse(txt);
      } catch (e3) {
        return '';
      }
    }
  }
}

// raw content loader for the admin editor, preserving .html, .md or .json format
async function loadRawContent(name) {
  const htmlPath = `./content/${name}.html`;
  const mdPath = `./content/${name}.md`;
  const jsonPath = `./content/${name}.json`;

  try {
    const data = await readFile(htmlPath, 'utf8');
    return { data, ext: 'html' };
  } catch {}
  try {
    const data = await readFile(mdPath, 'utf8');
    return { data, ext: 'md' };
  } catch {}
  try {
    const data = await readFile(jsonPath, 'utf8');
    return { data, ext: 'json' };
  } catch {}
  return { data: '', ext: 'html' };
}

// Basic routing
app.get("/", async (req, res, next) => {
  try {
    const footer = await loadContent('footer');
    const header = await loadContent('header');
    const navi   = await loadContent('navi');
    const news   = await loadContent('news');
    const home   = await loadContent('home').catch(() => ({}));
    res.render('index', { footer, header, navi, news, home });
  } catch (err) {
    next(err);
  }
});
// alias /index to /
app.get('/index', (req, res) => res.redirect('/'));

// generic page handler (serves content/<name>.html wrapped in header/footer)
app.get('/:page', async (req, res, next) => {
  const name = req.params.page;
  // ignore known paths that should fall through
  const skip = ['admin', 'assets', 'public', 'favicon.ico', 'style.css', 'script.js'];
  if (skip.includes(name)) return next();

  try {
    const pageContent = await loadContent(name);
    if (pageContent && pageContent.toString().trim()) {
      // assemble common fragments
      const header = await loadContent('header');
      const navi = await loadContent('navi');
      const footer = await loadContent('footer');
      // if header doesn't already contain nav, our loader may append it
      res.render('page', {
        title: name.charAt(0).toUpperCase() + name.slice(1),
        header,
        navi,
        footer,
        content: pageContent
      });
      return;
    }
  } catch (err) {
    // if file not found, fall through to 404
  }
  next();
});


// --- simple admin endpoints (optional password via ADMIN_PASSWORD env) ---
function checkAdmin(req, res, next) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return next();
  const supplied = req.body.password || req.query.password;
  if (supplied === secret) return next();
  res.status(401).send('unauthorized');
}

app.get('/admin/content/:name', checkAdmin, async (req, res, next) => {
  try {
    const name = req.params.name;
    const raw = await loadRawContent(name);
    const renderData = { name, data: raw.data, ext: raw.ext };
    // when editing header, also show navigation block for convenience
    if (name === 'header') {
      renderData.navi = await loadContent('navi');
    }
    res.render('admin', renderData);
  } catch (err) {
    next(err);
  }
});

app.post('/admin/content/:name', checkAdmin, async (req, res, next) => {
  try {
    const name = req.params.name;
    const content = req.body.data || '';
    const ext = req.body.ext === 'md'
      ? 'md'
      : req.body.ext === 'json'
      ? 'json'
      : 'html';

    await writeFile(`./content/${name}.${ext}`, content, 'utf8');
    // if header form submitted with nav area, update navi.html too
    if (name === 'header' && typeof req.body.naviData !== 'undefined') {
      await writeFile('./content/navi.html', req.body.naviData, 'utf8');
    }
    res.send('saved');
  } catch (err) {
    next(err);
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
