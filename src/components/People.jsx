import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Users } from 'lucide-react';
import { PEOPLE, PLATFORMS } from '../data/people';
import { PersonAvatar, PlatformIcon, ProfileLink } from './PeopleShared';
import './People.css';

export default function People({ onBack }) {
  const [platform, setPlatform] = useState('All');
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'People | Anik Roy';
    return () => { document.title = previousTitle; };
  }, []);
  const filtered = PEOPLE.filter(person => platform === 'All' || person.links[platform]);
  return <section className="people-page" aria-labelledby="people-title">
    <button type="button" className="people-back" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" />Back to portfolio</button>
    <header className="people-header"><div className="people-avatar-stack" aria-hidden="true">{PEOPLE.slice(0, 5).map(person => <PersonAvatar key={person.id} person={person} />)}<span>+{PEOPLE.length - 5}</span></div><p className="community-eyebrow">BUILDERS · EDUCATORS · OPEN SOURCE</p><h1 id="people-title">People I learn from<span>.</span></h1><p>A few people worth following for better React apps, thoughtful Webflow builds and practical AI workflows.</p><span className="people-tally"><Users size={15} aria-hidden="true" />{PEOPLE.length} people · {PLATFORMS.length} platforms</span></header>
    <div className="people-filters" role="group" aria-label="Filter people by platform">{['All', ...PLATFORMS].map(name => <button type="button" key={name} aria-pressed={platform === name} onClick={() => setPlatform(name)}>{name === 'All' ? <Users size={14} aria-hidden="true" /> : <PlatformIcon platform={name} size={14} />}{name}<span>{name === 'All' ? PEOPLE.length : PEOPLE.filter(person => person.links[name]).length}</span></button>)}</div>
    <p className="people-result-count" role="status" aria-live="polite">{platform === 'All' ? 'All' : platform} · {filtered.length} {filtered.length === 1 ? 'person' : 'people'}</p>
    <ul className="people-cards">{filtered.map(person => <li key={person.id} id={`person-${person.id}`} className="people-card"><div className="people-card-top"><PersonAvatar person={person} /><div><h2>{person.name}</h2><p>{person.role}</p></div><a className="people-card-follow" href={Object.values(person.links)[0]} target="_blank" rel="noopener noreferrer" aria-label={`View ${person.name}'s ${Object.keys(person.links)[0]} profile`}>Follow<ArrowUpRight size={14} aria-hidden="true" /></a></div><p className="people-reason"><span>Worth following for</span>{person.reason}</p><ul className="people-topics" aria-label={`${person.name}'s topics`}>{person.topics.map(topic => <li key={topic}>{topic}</li>)}</ul><div className="people-links" aria-label={`${person.name}'s public profiles`}>{Object.entries(person.links).map(([name, url]) => <ProfileLink key={name} person={person} platform={name} url={url} />)}</div></li>)}</ul>
  </section>;
}
