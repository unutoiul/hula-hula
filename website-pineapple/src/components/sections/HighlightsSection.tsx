import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { useContactForm } from '../../context/ContactFormContext';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { BadgePicture } from '../landing/BadgePicture';
import { useHighlights, type Highlight } from './cmsCards';
import { previewOffers } from './previewOffers';

export function HighlightsSection() {
  const published = useHighlights();
  const openContact = useContactForm();
  const preview = !published.length;
  const items = preview ? previewOffers.map(item => ({ ...item, onCta: () => openContact({
    topic: item.title, page: 'Offer preview',
    message: `Hello Royal Pineapple! I saw the “${item.title}” sample offer. Could you confirm the available dates, prices and inclusions?`,
  }) })) : published;

  return <section id="offers" className="offer-postcards" aria-labelledby="offers-heading">
    <div className="offer-postcards-intro">
      <Reveal><p className="royal-eyebrow"><span />A little extra, just for you</p>
        <h2 id="offers-heading">Your stay.<br /><em>Even sweeter.</em></h2>
        <p>Good days, lovely little extras, and one more reason to make it a Royal Pineapple holiday.</p>
        {preview && <span className="offer-preview-label">Two offer ideas to explore</span>}
      </Reveal>
    </div>
    <div className="offer-postcards-grid">
      {items.map((item, index) => <Reveal key={item.id} delay={index * .1}><HighlightCard item={item} alternate={index % 2 === 1} /></Reveal>)}
    </div>
  </section>;
}

/** Also used by the CMS preview; published cards keep their original CTA and terms. */
export function HighlightCard({ item, alternate = false }: { item: Highlight; alternate?: boolean }) {
  return <article className={`offer-postcard${alternate ? ' offer-postcard-plum' : ''}`}>
    <div className="offer-postcard-topline"><span>{item.preview ? 'OFFER PREVIEW' : item.kind === 'offer' ? 'BOOK A LITTLE HAPPINESS' : 'WHAT’S ON'}</span><img src={alternate ? '/logo/royal-pineapple-white.svg' : '/logo/royal-pineapple.svg'} alt="Royal Pineapple Hotel" width={43} height={37} loading="lazy" /></div>
    <div className="offer-postcard-photo"><BadgePicture frameName={alternate ? 'evening-garden' : 'pool-club'} label={item.title}>
      <ResortPhoto image={item.image} alt={item.title} sizes="(max-width: 600px) 90vw, 33vw" />
    </BadgePicture></div>
    <div className="offer-postcard-copy">
      {item.tag && <span className={`offer-value${item.tag.includes('%') ? ' offer-value-discount' : ''}`}>{item.tag}</span>}
      <p className="offer-postcard-kicker">{item.label}</p>
      <h3>{item.title}</h3>
      {item.description && <p className="offer-postcard-description">{item.description}</p>}
      {item.perks.length > 0 && <ul>{item.perks.slice(0, 3).map(perk => <li key={perk}><CheckRounded aria-hidden="true" />{perk}</li>)}</ul>}
      {item.ctaLabel && (item.onCta
        ? <button type="button" className="offer-postcard-cta" onClick={item.onCta}>{item.ctaLabel}<ArrowForwardRounded aria-hidden="true" /></button>
        : <a className="offer-postcard-cta" href={item.ctaHref}>{item.ctaLabel}<ArrowForwardRounded aria-hidden="true" /></a>)}
      {item.note && <p className="offer-postcard-terms">{item.note}</p>}
    </div>
  </article>;
}
