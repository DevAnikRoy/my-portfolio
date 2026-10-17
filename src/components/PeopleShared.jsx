import { useState } from 'react';
import { ArrowUpRight, Github, Linkedin, Globe, Mail, Youtube } from 'lucide-react';
import { SiX, SiFacebook } from 'react-icons/si';

const ICONS = { GitHub: Github, X: SiX, LinkedIn: Linkedin, Facebook: SiFacebook, Website: Globe, YouTube: Youtube, Email: Mail };

export function PlatformIcon({ platform, size = 16 }) {
  const Icon = ICONS[platform] || Globe;
  return <Icon size={size} aria-hidden="true" />;
}

export function PersonAvatar({ person }) {
  const [failed, setFailed] = useState(false);
  return <span className="people-avatar" aria-hidden="true">{person.name.split(' ').map(part => part[0]).slice(0, 2).join('')}{person.github && !failed
    ? <img src={`https://github.com/${person.github}.png?size=112`} alt="" width="56" height="56" loading="lazy" onError={() => setFailed(true)} />
    : null}</span>;
}

export function ProfileLink({ person, platform, url }) {
  return <a className="people-profile-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on ${platform}`} title={`${person.name} on ${platform}`}><PlatformIcon platform={platform} /><span>{platform}</span><ArrowUpRight size={12} aria-hidden="true" /></a>;
}
