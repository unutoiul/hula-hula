// A disposable account verifies real sign-in and RLS, without sending email.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const config={auth:{persistSession:false,autoRefreshToken:false}};
const server=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,config);
const browser=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,config);
const publicRows=await browser.from('activities').select('weekday').order('weekday');
assert.equal(publicRows.error,null);assert.equal(publicRows.data.length,7);
const bookings=await browser.from('bookings').select('id');
assert.ok(bookings.error,'Public booking access must fail');
const anonRpc=await browser.rpc('admin_booking_list');assert.ok(anonRpc.error,'Anon staff RPC must fail');
const email=`website-qa-${Date.now()}@example.invalid`;
let userId,draftId;
try {
  const password=randomBytes(24).toString('base64url');
  const created=await server.auth.admin.createUser({email,password,email_confirm:true});
  assert.equal(created.error,null);userId=created.data.user.id;
  const signedIn=await browser.auth.signInWithPassword({email,password});assert.equal(signedIn.error,null);
  const nonAdmin=await browser.rpc('is_admin');assert.equal(nonAdmin.error,null);assert.equal(nonAdmin.data,false);
  const denied=await browser.from('activities').insert({title:'Unauthorized test',published:false});assert.ok(denied.error);
  const allow=await server.from('admins').insert({email});assert.equal(allow.error,null);
  const admin=await browser.rpc('is_admin');assert.equal(admin.error,null);assert.equal(admin.data,true);
  const createdDraft=await browser.from('activities').insert({title:'Disposable staff verification',published:false}).select('id').single();
  assert.equal(createdDraft.error,null);draftId=createdDraft.data.id;
  const update=await browser.from('activities').update({title:'Verified staff edit'}).eq('id',draftId).select('title').single();
  assert.equal(update.error,null);assert.equal(update.data.title,'Verified staff edit');
  const staffBookings=await browser.rpc('admin_booking_list');assert.equal(staffBookings.error,null);assert.ok(Array.isArray(staffBookings.data));
  console.log(JSON.stringify({publicProgrammeDays:7,anonymousBookingsBlocked:true,anonymousAdminBlocked:true,nonStaffWritesBlocked:true,staffSignIn:true,staffCmsCreateAndEdit:true,staffBookingDesk:true,emailsSent:0}));
} finally {
  if(draftId)await server.from('activities').delete().eq('id',draftId);
  await server.from('admins').delete().eq('email',email);
  if(userId)await server.auth.admin.deleteUser(userId);
  await browser.auth.signOut();
}
