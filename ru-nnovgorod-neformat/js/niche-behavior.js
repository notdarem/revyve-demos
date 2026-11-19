/* =====================================================================
   niches/furniture/behavior.js — «Показать все работы».
   В готовом сайте лежит как js/niche-behavior.js; main.js подгружает его после загрузки.
   Без JS видны все работы. С JS сразу видны первые 7 (чтобы до отзывов и цен не надо было
   листать два десятка фото) — это делает CSS по классу .js, с первого кадра и без сдвига страницы;
   здесь только снятие ограничения: кнопкой или фильтром по типам (человек выбрал «Кухни» —
   видит все кухни). Лайтбокс листает все работы в любом случае.
   ===================================================================== */
const list = document.querySelector('.mosaic--show');
const more = document.querySelector('[data-works-more]');

if (list && more) {
  const open = (focus) => {
    if (list.classList.contains('is-open')) return;
    const first = list.children[+list.dataset.show || 7];
    list.classList.add('is-open');
    more.hidden = true;
    if (focus && first) { const a = first.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
  };
  more.querySelector('button').addEventListener('click', () => open(true));
  document.addEventListener('site:filter', () => open(false));
  /* фильтр могли нажать раньше, чем загрузился этот файл */
  if (document.querySelector('.filter [data-filter][aria-pressed="true"]:not([data-filter=""])')) open(false);
}
