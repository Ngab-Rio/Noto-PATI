import { logout } from '../actions';

export async function POST() {
  await logout();
  // Redirect akan dihandle oleh logout() action
  return new Response(null, { status: 302 });
}
