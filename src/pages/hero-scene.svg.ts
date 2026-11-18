import { heroSceneSVG } from '../lib/grape';
export function GET() {
  return new Response(heroSceneSVG(), { headers: { 'Content-Type': 'image/svg+xml' } });
}
