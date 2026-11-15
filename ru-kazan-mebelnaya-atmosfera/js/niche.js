/* =====================================================================
   niches/furniture/blocks.js — блоки «Мебель на заказ».
   Фабрика получает помощники ядра (h) и ничего не импортирует: в готовом
   сайте файл лежит как js/niche.js рядом с js/render.js.
   Главное — фото работ: портфолио сразу после первого экрана, фото огромные
   и в своих пропорциях (вертикальный шкаф не режется до 4:3).
   Нет данных — блок не выводится. Главная кнопка — «Позвонить».
   ===================================================================== */
export default function furniture(h) {
  const { esc, t, tx, raw, icon, pic, B, num, plural, d, lang } = h;

  const chips = (lst) => `<ul class="fchips">${lst.items.map((s) => `<li class="tag">${tx(s)}</li>`).join('')}</ul>`;
  const SHOW = 7; // сколько работ видно сразу (с JS); остальные — по кнопке «Показать все»

  const blocks = {
    /* 1. Портфолио — главный блок. Первый кадр крупнее (если он горизонтальный), остальные — в две колонки
       в своих пропорциях. Фильтр — только по типам, которые есть в данных. Разметка совместима с ядром:
       .filter / .mosaic__item / [data-lb] — фильтр и лайтбокс работают из main.js. */
    works(m) {
      if (!m.portfolio.length) return null;
      if (m.portfolio.some((p) => p.before)) return B.works(m); // пары до/после — общая мозаика ядра
      const total = m.portfolio.length;
      const types = [...new Set(m.portfolio.map((p) => raw(p.type)).filter(Boolean))];
      const count = (ty) => m.portfolio.filter((p) => raw(p.type) === ty).length;
      const filter = types.length > 1
        ? `<div class="filter" role="group" aria-label="${esc(t('filter_label'))}" hidden><button type="button" class="chip" aria-pressed="true" data-filter="">${esc(t('filter_all'))}<span class="chip__n" aria-hidden="true">${total}</span></button>${types.map((ty) => `<button type="button" class="chip" aria-pressed="false" data-filter="${esc(ty)}">${esc(ty)}<span class="chip__n" aria-hidden="true">${count(ty)}</span></button>`).join('')}</div>` : '';
      const items = m.portfolio.map((p, i) => {
        const cap = raw(p.caption);
        const type = raw(p.type);
        const label = t('open_photo', { caption: cap || type || t('photo_n', { n: i + 1, total }) });
        const alt = raw(p.alt) || cap;
        const ratio = p.img.w / p.img.h;
        const big = i === 0 && ratio >= 1.25 && total > 1;
        const ar = big ? Math.min(2, Math.max(1.5, ratio)) : Math.min(1.9, Math.max(0.72, ratio));
        const sizes = big ? '(min-width: 1440px) 1320px, 100vw' : '(min-width: 1440px) 650px, (min-width: 768px) 50vw, 100vw';
        const capHtml = cap || type ? `<p class="mosaic__cap">${type ? `<span class="mosaic__type">${esc(type)}</span>` : ''}${cap ? `<span class="mosaic__text">${tx(p.caption)}</span>` : ''}</p>` : '';
        return `<li class="mosaic__item${big ? ' is-big' : ''}" data-type="${esc(type)}"><a class="mosaic__link panel" href="${esc(p.img.lg)}" data-lb="${i}" style="--ar:${ar.toFixed(3)}"><span class="vh">${esc(label)}${alt && alt !== cap ? '. ' + esc(alt) : ''} </span>${pic(p.img, { alt: '', sizes })}</a>${capHtml}</li>`;
      }).join('');
      const more = total > SHOW ? `<p class="works__more" data-works-more><button type="button" class="btn btn--ghost">${esc(t('works_all', { n: total }))}</button></p>` : '';
      return {
        title: t('sec_works'), nav: t('sec_works_nav'),
        lead: total >= 3 ? esc(t('works_lead', { n: plural(d.works_n, total, lang) })) : '',
        body: `${filter}<ul class="mosaic mosaic--show" data-count="${total}" data-show="${SHOW}">${items}</ul>${more}`
      };
    },

    /* Отзывы: первый выводится крупно, поэтому первым ставим самый короткий из содержательных (от 80 знаков) —
       длинный отзыв крупным шрифтом превращается в стену текста. Сами тексты не меняются и не сокращаются. */
    reviews(m) {
      const len = (r) => raw(r.text).length;
      const pool = m.reviews.filter((r) => len(r) >= 80);
      const best = pool.sort((a, b) => len(a) - len(b))[0];
      return B.reviews(best && best !== m.reviews[0] ? { ...m, reviews: [best, ...m.reviews.filter((r) => r !== best)] } : m);
    },

    /* 2. Цены — только если есть в источниках, в формате источника. Мало позиций — крупной типографикой
       (название слева, цена справа), много — обычная доска ядра по категориям. */
    prices(m) {
      const base = B.prices(m);
      if (!base) return null;
      const total = m.prices.reduce((s, c) => s + c.items.length, 0);
      if (total > 10) return base;
      const multi = m.prices.length > 1;
      const rows = m.prices.map((c) => `${multi ? `<li class="fprice__cat"><h3>${tx(c.category)}</h3>${c.note ? `<p>${tx(c.note)}</p>` : ''}</li>` : ''}${c.items.map((it) => `<li class="fprice__row"><span class="fprice__name">${tx(it.name)}${it.note ? `<small>${tx(it.note)}</small>` : ''}${it.duration ? `<small><span class="vh">${esc(t('duration'))}: </span>${tx(it.duration)}</small>` : ''}</span><strong class="fprice__val">${tx(it.price)}</strong></li>`).join('')}`).join('');
      const cut = base.body.indexOf('<div class="pnotes">');
      const single = !multi && m.prices[0].note ? `<p class="fprice__note">${tx(m.prices[0].note)}</p>` : '';
      return { ...base, body: `<ul class="fprice card">${rows}</ul>${single}${cut < 0 ? '' : base.body.slice(cut)}` };
    },

    /* 3. Что делаем и из чего — только то, что указано в источниках */
    materials(m) {
      const n = m.niche;
      if (!(n.products || n.materials || n.hardware)) return null;
      const g = (key, lst) => (lst ? `<div class="mat__g"><h3 class="mat__h">${esc(t(key))}</h3>${chips(lst)}</div>` : '');
      const onlyProducts = n.products && !n.materials && !n.hardware;
      return {
        title: t(onlyProducts ? 'sec_products' : n.products ? 'sec_materials_all' : 'sec_materials'),
        body: `<div class="mat">${g('products_label', n.products)}${g('materials_label', n.materials)}${g('hardware_label', n.hardware)}</div>${n.materials_note ? `<p class="mat__note">${tx(n.materials_note)}</p>` : ''}`
      };
    },

    /* 4. Как проходит заказ. Нейтральные шаги (замер → проект → производство → установка) есть всегда:
       они ничего не обещают. Пояснения, сроки, «бесплатно» и шаги «консультация / договор / доставка» —
       только из источников (lead.niche.order с source_url). */
    order(m) {
      const src = Object.fromEntries((m.niche.order || []).map((s) => [s.kind, s]));
      const NEUTRAL = ['measure', 'design', 'production', 'install'];
      const kinds = ['consult', 'measure', 'design', 'contract', 'production', 'delivery', 'install'].filter((k) => NEUTRAL.includes(k) || src[k]);
      return {
        title: t('sec_order'), nav: t('sec_order_nav'),
        body: `<ol class="ord${kinds.length > 5 ? ' ord--wrap' : ''}" style="--n:${kinds.length}">${kinds.map((k, i) => `<li class="ord__i"><span class="ord__no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="ord__t">${esc(t('o_' + k))}</h3>${src[k] && src[k].term ? `<p class="ord__term tag">${tx(src[k].term)}</p>` : ''}${src[k] && src[k].text ? `<p class="ord__d">${tx(src[k].text)}</p>` : ''}</li>`).join('')}</ol>`
      };
    },

    /* 5. Условия: гарантия, оплата, рассрочка, доставка — только из источников */
    terms(m) {
      const a = m.niche.terms || [];
      if (!a.length) return null;
      const IC = { warranty: 'shield', payment: 'payment', installment: 'payment', delivery: 'tow', assembly: 'check', area: 'pin', other: 'other' };
      return {
        title: t('sec_terms'),
        body: `<dl class="terms card">${a.map((x) => `<div class="terms__i"><dt>${icon(IC[x.kind] || 'other')}<span>${x.title ? tx(x.title) : esc(t('t_' + x.kind))}</span></dt><dd>${tx(x.text)}</dd></div>`).join('')}</dl>`
      };
    },

    /* 6. Главный призыв: не «вызвать замерщика», а «звоните» — номер крупно, мессенджеры рядом */
    call(m) {
      const p = m.phones[0];
      if (!p) return null;
      const loc = m.locations[0];
      const rest = m.phones.slice(1).map((x) => `<li><a class="tel" href="tel:${esc(x.tel)}">${esc(x.display)}</a>${x.label ? `<span>${tx(x.label)}</span>` : ''}</li>`).join('');
      const msgs = m.messengers.map((x) => `<li><a class="mlink" href="${esc(x.url)}" target="_blank" rel="noopener">${icon(x.type)}<span>${esc(t('m_' + x.type))}</span></a></li>`).join('');
      return {
        title: t('sec_call'), cls: 'sec--panel',
        body: `<div class="call"><a class="call__tel" href="tel:${esc(p.tel)}" aria-label="${esc(t('call_to', { phone: p.display }))}">${icon('phone', 'call__ic')}<span>${esc(p.display)}</span></a>${p.label ? `<p class="call__lbl">${tx(p.label)}</p>` : ''}${loc && loc.hours ? `<p class="status status--line call__status" data-status="0" hidden></p>` : ''}${rest ? `<ul class="call__rest">${rest}</ul>` : ''}${msgs ? `<div class="call__msg"><p class="call__or">${esc(t('call_or'))}</p><ul class="mlinks">${msgs}</ul></div>` : ''}</div>`
      };
    }
  };

  return {
    ldType: 'FurnitureStore',
    /* названия блоков для отчёта сборки */
    names: { works: 'Портфолио', prices: 'Цены', materials: 'Что делаем и из чего', order: 'Как проходит заказ', terms: 'Условия', call: 'Главный призыв «Звоните»', more: 'Ещё о нас' },
    /* якоря шапки: приоритет (берутся первые 5 выведенных, в порядке страницы) */
    nav: ['works', 'reviews', 'prices', 'order', 'contacts'],
    asks: (m) => [
      ...(!(m.niche.order || []).length ? [{ block: 'order', ask: 'Как проходит заказ: замер платный или бесплатный, сколько делается проект, сроки изготовления, кто ставит? Сейчас на сайте только нейтральные шаги без сроков.' }] : []),
      ...(m.portfolio.length && m.portfolio.length < 6 ? [{ block: 'works', ask: `Больше фото работ: сейчас ${m.portfolio.length}, для мебели нужно от 8–12 крупных фото.` }] : []),
      ...(m.portfolio.length && !m.portfolio.some((p) => raw(p.caption)) ? [{ block: 'works', ask: 'Подписи к работам: что это, из чего сделано, для кого.' }] : [])
    ],
    /* портфолио — сразу после первого экрана, отзывы рядом; дальше «сколько, из чего, как, условия», призыв */
    order: ['hero', 'works', 'reviews', 'prices', 'materials', 'order', 'terms', 'call', 'more', 'faq', 'contacts'],
    blocks,
    ask: {
      works: 'Фото готовой мебели: кухни, шкафы, гардеробные — крупные, от 1600 px по ширине, с подписями.',
      prices: 'Цены: «от … за погонный метр», «от … за проект» — как вы сами называете клиентам.',
      materials: 'Из чего делаете: плиты, фасады, столешницы, фурнитура (производители).',
      terms: 'Гарантия, оплата (предоплата, рассрочка), доставка и сборка.',
      reviews: 'Ссылки на карточки с отзывами (Яндекс, 2ГИС, Google).',
      faq: 'Частые вопросы клиентов и ваши ответы.',
      contacts: 'Адрес цеха или шоурума, часы работы, как найти вход.'
    }
  };
}
