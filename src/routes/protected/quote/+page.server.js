import { baserowService } from '$lib/services/baserow';
import { createBooking } from '$lib/booking/create-booking';

export const actions = {
    createClient: async ({ request }) => {
        try {
            const data = await request.formData();

            const contact = await baserowService.contacts.create({
                'First Name': data.get('firstName'),
                'Last Name': data.get('lastName'),
                'Email': data.get('email'),
                'Phone': data.get('phone'),
                'Status': 'Lead',
                'Lead Status': 'New',
                'Type': ['Residential'],
                'SMS Consent': data.get('smsConsent') === 'on',
                'Email Consent': true,
            });

            return {
                success: true,
                clientId: contact.id,
            };
        } catch (error) {
            console.error('Client creation failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    },

    finalizeBooking: async ({ request }) => {
        try {
            const d = await request.formData();
            console.log(d);

            const result = await createBooking({
                clientId: d.get('clientId') ? Number(d.get('clientId')) : null,
                customer: JSON.parse(d.get('customer')),
                quote: JSON.parse(d.get('quoteTotal')),
                propertyData: {
                    streetAddress: d.get('streetAddress'),
                    city: d.get('city'),
                    state: d.get('state'),
                    zipcode: d.get('zipcode'),
                    propertyType: d.get('propertyType'),
                    bedrooms: d.get('bedrooms'),
                    bathrooms: d.get('bathrooms'),
                    sqft: d.get('sqft'),
                },
                serviceDateTime: d.get('preferredDateTime'),
                depositRate: 0.25,
            });

            return result || null;
        } catch (error) {
            console.error('Booking finalization failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
}