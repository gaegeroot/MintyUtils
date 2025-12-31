import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
  // Get booking data from URL search params
  const booking = {
    total: parseFloat(url.searchParams.get('total') || '0'),
    sqft: parseInt(url.searchParams.get('sqft') || '0'),
    bathrooms: parseFloat(url.searchParams.get('bathrooms') || '0'),
    firstTimeClean: url.searchParams.get('firstTimeClean') === 'true',
    moveInOut: url.searchParams.get('moveInOut') === 'true',
    pets: url.searchParams.get('pets') === 'true',
    fragileItems: url.searchParams.get('fragileItems') === 'true',
    urgentTimeline: url.searchParams.get('urgentTimeline') === 'true',
    accessDifficulty: url.searchParams.get('accessDifficulty') || 'easy',
    schedule: url.searchParams.get('schedule') || 'One-time'
  };
  
  return {
    booking
  };
}