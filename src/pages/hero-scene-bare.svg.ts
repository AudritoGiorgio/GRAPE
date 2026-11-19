import { heroSceneSVG, type HeroItem } from '../lib/grape';
// the hero background without clusters, front leaves or the post: the live canvas draws those
export function GET() {
  const sink: HeroItem[] = [];
  return new Response(heroSceneSVG(sink), { headers: { 'Content-Type': 'image/svg+xml' } });
}
