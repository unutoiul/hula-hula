import { management } from './royal-database.mjs';
if (!process.env.RESEND_API_KEY) throw new Error('Configured email provider key required');
await management('/config/auth','PATCH',{
  smtp_host:'smtp.resend.com',smtp_port:'465',smtp_user:'resend',smtp_pass:process.env.RESEND_API_KEY,
  smtp_admin_email:'reservation@hulahularesort.com',smtp_sender_name:'Royal Pineapple Hotel',
  mailer_subjects_recovery:'Set your staff password — Royal Pineapple Hotel',
});
console.log('Connected staff password recovery to the existing verified hotel email sender. No email sent.');
