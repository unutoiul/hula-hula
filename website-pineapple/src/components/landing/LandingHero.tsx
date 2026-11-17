import East from '@mui/icons-material/East';
import { Button } from '@mui/material';
import { BookingSearchBar } from '../booking/BookingSearchBar';
import { PostcardCollage } from './PostcardCollage';
import { RoyalHeadline } from './RoyalHeadline';
import { KrabiNow } from './KrabiNow';
import './landing.css';
import './splash.css';
import './postcard-hero.css';

export function LandingHero() {
  return <section className="story-hero" aria-labelledby="royal-hero-title">
    <div className="royal-wrap">
      <div className="story-hero-grid">
        <div className="story-hero-copy">
          <p className="royal-eyebrow"><span />Your happy little corner of Krabi</p>
          <RoyalHeadline />
          <p className="story-hero-description">Golden arches. Pink pool days. A balcony of your own. A little European romance, a warm Thai welcome, and all the good feeling of a Hula Hula holiday.</p>
          <div className="story-hero-actions">
            <Button href="#booking-search" variant="contained" endIcon={<East />}>Find your happy place</Button>
            <a className="royal-text-link" href="#rooms">Take a little look <span aria-hidden="true">↗</span></a>
          </div>
          <KrabiNow />
        </div>
        <PostcardCollage />
      </div>
      <div className="royal-booking-row story-hero-booking" id="booking-search">
        <div className="royal-booking-intro"><p>A little getaway starts here</p><h2>Good times start with a date.</h2></div>
        <div className="royal-booking"><BookingSearchBar wide /></div>
      </div>
      <div className="story-hero-foot"><span>European charm. Thai heart. Hula Hula spirit.</span><a href="#welcome">Make yourself a little at home <span aria-hidden="true">↓</span></a></div>
    </div>
  </section>;
}
