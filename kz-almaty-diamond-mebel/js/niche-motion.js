/* =====================================================================
   niches/furniture/motion.js — движение «Мебели на заказ»: спокойно и тепло.
   В готовом сайте лежит как js/niche-motion.js рядом с js/motion.js,
   поэтому импорт относительный './motion.js?v=192ix0g' (в исходниках не запускается).
   Фото работ появляются общим правилом ядра (.mosaic → .mosaic__item);
   здесь — только блоки ниши. Характер (длительности, сдвиг) — из темы.
   ===================================================================== */
import { register } from './motion.js?v=192ix0g';

register(({ P, reveal }) => {
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* цены крупной типографикой: строки ложатся по одной */
  $$('.fprice').forEach((c) => reveal(c, '.fprice__row, .fprice__cat', { stagger: P.stagger * 0.7 }));
  /* материалы и фурнитура: чипы каскадом */
  $$('.mat').forEach((c) => reveal(c, '.fchips li', { stagger: P.stagger * 0.4, shift: P.shift * 0.6 }));
  /* шаги заказа — по очереди, чуть медленнее обычного */
  $$('.ord').forEach((c) => reveal(c, '.ord__i', { stagger: P.stagger * 1.6 }));
  $$('.terms').forEach((c) => reveal(c, '.terms__i'));
  /* призыв: номер и мессенджеры поднимаются вместе (с кнопками — без маски, нажимаются сразу) */
  $$('.call').forEach((c) => reveal(c, null));
  $$('.works__more').forEach((c) => reveal(c, null));
});
