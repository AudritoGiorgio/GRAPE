import { heroAerialSVG } from '../lib/heroArt';
export function GET() {
  return new Response(heroAerialSVG(), { headers: { 'Content-Type': 'image/svg+xml' } });
}
