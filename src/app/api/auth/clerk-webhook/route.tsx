import { addUser, deleteUser, updateUser } from '@/services/user.service'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)
    const eventType = evt.type

    const { id: clerkUserId, primary_email_address_id, first_name, last_name } = evt.data as {
      id: string;
      primary_email_address_id: string;
      first_name: string;
      last_name: string;
    };
    const fullName = `${first_name} ${last_name || ''}`.trim();

    let email: string = '';
    if ('email_addresses' in evt.data && Array.isArray((evt.data as any).email_addresses)) {
      email = (evt.data as any).email_addresses.find((email: any) => email.id === primary_email_address_id)?.email_address;
    }
    let res = null;
    switch (eventType) {
      case 'user.created':

        res = await addUser({
          clerkUserId,
          email,
          fullName
        }) // Will return [user, error] where user is the newly created user object and error is null if successful, or an error object if there was an issue. and user is a array of the newly created user object 

        if (res[1])
          return new Response('Error adding user', { status: 500 })

        break;
      case 'user.updated':
        res = await updateUser(clerkUserId, {
          fullName,
          email,
          updatedAt: new Date()
        })

        if (res[1])
          return new Response('Error updating user', { status: 500 })

        break;
      case 'user.deleted':
        res = await deleteUser(evt.data.id as string) // Will return [success, error] where success is a boolean indicating whether the deletion was successful and error is null if successful, or an error object if there was an issue.

        if (res[1])
          return new Response('Error deleting user', { status: 500 })

        break;
      default:
        console.log('Unhandled event type:', eventType);
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    return new Response('Error verifying webhook or handing event', { status: 500 })
  }
}