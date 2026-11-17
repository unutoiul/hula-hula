import { useState } from 'react';
import { Reveal } from '../common/ScrollMotion';
import { artwork, postcards } from './artwork';
import { PostcardDialog } from './PostcardDialog';

export function PostcardsSection() {
  const [selected, setSelected] = useState<(typeof postcards)[number] | null>(null);
  return <section className="royal-postcards" id="postcards" aria-labelledby="royal-postcards-title">
    <img className="keepsake-botanical-corner" src={artwork.postcardCorner} alt="" aria-hidden="true" width={1536} height={1024} loading="lazy" decoding="async" />
    <div className="royal-wrap">
      <Reveal><div className="royal-section-heading"><p>The Royal Pineapple keepsake collection</p><h2 id="royal-postcards-title">A little Krabi.<br /><em>Yours to keep.</em></h2><p>A Riviera daydream. A favourite balcony. A little grand-tour glamour. Pick a postcard or a vintage travel badge, and take a little sunshine with you.</p></div></Reveal>
      <div className="royal-postcard-grid">{postcards.map((card, i) => <Reveal key={card.id} delay={i * .08}><button className={`royal-postcard royal-postcard-${card.id}`} type="button" onClick={() => setSelected(card)} aria-label={`Open postcard: ${card.title}`}>
        <div className={`royal-postcard-picture royal-postcard-picture-${card.kind}`}><img src={card.image} alt={card.alt} width={card.width} height={card.height} loading="lazy" decoding="async" /></div><span className="royal-postcard-label"><span>{card.title}<small>View & keep ↗</small></span><img className="postcard-brand-mark" src="/logo/royal-pineapple.svg" alt="" aria-hidden="true" width={54} height={46} loading="lazy" /></span>
      </button></Reveal>)}</div>
      <p className="royal-postcard-note">Six favourite keepsakes. One very Royal Pineapple welcome.</p>
    </div>
    <PostcardDialog postcard={selected} onClose={() => setSelected(null)} />
  </section>;
}
