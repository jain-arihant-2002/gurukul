import { addUser, deleteUser, updateUser } from '@/services/user.service'
import { ServiceError, User } from '@/utils/types'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'


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

    switch (eventType) {
      case 'user.created':
        const [newUser, addError] = await addUser({
          clerkUserId,
          email,
          fullName
        });

        if (addError) {
          console.error('Error adding user:', addError.message, addError.error);
          return NextResponse.json(
            { error: addError.message },
            { status: 500 }
          );
        }

        console.log('User created successfully:', newUser);
        break;

      case 'user.updated':
        const [updatedUser, updateError]: [User[] | null, ServiceError | null] = await updateUser(clerkUserId, {
          fullName,
          email,
          updatedAt: new Date()
        });

        if (updateError) {
          console.error('Error updating user:', updateError.message, updateError.error);
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          );
        }

        console.log('User updated successfully:', updatedUser);
        break;

      case 'user.deleted':
        const [deletionSuccess, deleteError]: [boolean | null, ServiceError | null] = await deleteUser(evt.data.id as string);

        if (deleteError) {
          console.error('Error deleting user:', deleteError.message, deleteError.error);
          return NextResponse.json(
            { error: deleteError.message },
            { status: 500 }
          );
        }
        //TODO: delete all cloudinary files related to the user
        console.log('User deleted successfully:', deletionSuccess);
        break;

      default:
        console.log('Unhandled event type:', eventType);
    }

    return NextResponse.json(
      { message: 'Webhook received and processed successfully' },
      { status: 200 }
    );

  } catch (err) {
    console.error('Error verifying webhook or handling event:', err);
    return NextResponse.json(
      { error: 'Error verifying webhook or handling event' },
      { status: 500 }
    );
  }
}