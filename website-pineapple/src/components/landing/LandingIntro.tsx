import East from '@mui/icons-material/East';
import { Button } from '@mui/material';
import { pillars } from '../../data/content';
import { Reveal } from '../common/ScrollMotion';
import { artwork } from './artwork';

export function LandingIntro() {
  return <section id="welcome" className="royal-intro" aria-labelledby="royal-welcome-title">
    <div className="royal-wrap">
      <Reveal><div className="royal-section-heading"><p className="royal-eyebrow">A warm welcome, with a twist</p><h2 id="royal-welcome-title">A little grand.<br /><em>A lot of good feeling.</em></h2></div></Reveal>
      <div className="royal-intro-grid">
        <Reveal><div className="royal-welcome-art">
          <img className="royal-welcome-sticker" src={artwork.luggage} alt="Royal Pineapple’s European-style hotel, palms and pink pineapple on a vintage travel sticker" width={1100} height={902} loading="lazy" decoding="async" />
          <span className="royal-welcome-note">Your happy little home<br />in the heart of Krabi.</span>
        </div></Reveal>
        <Reveal delay={.1}><div className="royal-intro-copy">
          <p className="royal-eyebrow">The Royal Pineapple story</p>
          <h3>European charm.<br /><em>Thai heart.</em></h3>
          <p>Golden arches. A balcony of your own. Pink loungers by a turquoise pool. Our little corner of Krabi Town has a personality all its own.</p>
          <p>Head out for markets, riverside walks and island days. Come home to good food, friendly faces, and a wonderfully easy afternoon.</p>
          <Button href="#rooms" color="inherit" endIcon={<East />}>Find your little corner</Button>
          <div className="royal-intro-signature"><img src={artwork.mascot} alt="" aria-hidden="true" width={480} height={480} loading="lazy" /><span>A pineapple welcome.<br /><strong>Every single time.</strong></span></div>
        </div></Reveal>
      </div>
      <div className="royal-facts" aria-label="A little about the hotel">
        <div><strong>72</strong><span>rooms with a balcony</span></div><div><strong>24/7</strong><span>poolside café & social hub</span></div><div><strong>Krabi Town</strong><span>your local starting point</span></div><div><strong>One big</strong><span>Thai welcome</span></div>
      </div>
      <nav className="royal-pillars" aria-label="Explore your stay">{pillars.map((pillar, i) => <a key={pillar.word} href={pillar.href}><span className="royal-pillar-number">0{i + 1}</span><strong>{pillar.word}</strong><span>{pillar.line}</span><East aria-hidden="true" /></a>)}</nav>
    </div>
  </section>;
}
