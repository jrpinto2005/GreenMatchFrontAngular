
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/chat"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 16158, hash: '8ed7d19488e66ef9b399e5f58cc724de5cf0e7f47e90e2e9f5349791b932d1b4', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 11781, hash: '890d8b092c26846fe0d75d718b47169b864eb323f589ef1302a47dfefacacbcb', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'login/index.html': {size: 22043, hash: 'ca6e3819f92c2a2678e13a4e7827093aafe7d5a567699434c0751819dc5f30f8', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'chat/index.html': {size: 34239, hash: '46aef5677226b690bf316c0ae0782c7055189d5868794eb3b011d24dc078b95f', text: () => import('./assets-chunks/chat_index_html.mjs').then(m => m.default)},
    'styles-F2APAUWL.css': {size: 227091, hash: '6eDZIpz6zX0', text: () => import('./assets-chunks/styles-F2APAUWL_css.mjs').then(m => m.default)}
  },
};
