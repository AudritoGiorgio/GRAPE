import { heroCameraSVG } from '../lib/heroArt';
export function GET() {
  return new Response(heroCameraSVG(), { headers: { 'Content-Type': 'image/svg+xml' } });
}
