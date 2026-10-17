import { useId } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { PEOPLE, MY_PROFILES } from '../data/people';
import { PersonAvatar, PlatformIcon } from './PeopleShared';
import './People.css';

export default function CommunitySidebar({ onPeople, onContact, isPeople = false }) {
  const headingId = useId();
  return <aside className="community-sidebar" aria-label="Community and social profiles">
    <a className="community-follow" href="https://github.com/DevAnikRoy" target="_blank" rel="noopener noreferrer"><PlatformIcon platform="GitHub" />Follow on GitHub<ArrowUpRight size={15} aria-hidden="true" /></a>
    <div className="community-note"><span className="community-eyebrow">LET’S BUILD SOMETHING</span><h2>From idea to a working product.</h2><p>React apps, Webflow experiences and AI-powered workflows.</p><button type="button" onClick={onContact}>Let’s talk<ArrowUpRight size={15} aria-hidden="true" /></button></div>
    {!isPeople && <section className="community-section" aria-labelledby={`${headingId}-follow`}><h2 id={`${headingId}-follow`}>Who to follow<span>{PEOPLE.length}</span></h2><ul className="community-people">{PEOPLE.slice(0, 3).map(person => <li key={person.id}><button className="community-person" type="button" onClick={() => onPeople(person.id)}><PersonAvatar person={person} /><span><strong>{person.name}</strong><small>{person.role}</small></span></button><a className="community-person-follow" href={Object.values(person.links)[0]} target="_blank" rel="noopener noreferrer" aria-label={`View ${person.name}'s ${Object.keys(person.links)[0]} profile`}>Follow<ArrowUpRight size={12} aria-hidden="true" /></a></li>)}</ul><button className="community-all" type="button" onClick={() => onPeople()}>See all {PEOPLE.length} people<ArrowRight size={15} aria-hidden="true" /></button></section>}
    <section className="community-section" aria-labelledby={`${headingId}-socials`}><h2 id={`${headingId}-socials`}>Find me on</h2><ul className="community-socials">{MY_PROFILES.map(profile => <li key={profile.platform}><a href={profile.href} target={profile.platform === 'Email' ? undefined : '_blank'} rel="noopener noreferrer"><span className="community-platform"><PlatformIcon platform={profile.platform} size={18} /></span><span><strong>{profile.platform}</strong><small>{profile.label}</small></span><ArrowUpRight size={15} aria-hidden="true" /></a></li>)}</ul></section>
  </aside>;
}
