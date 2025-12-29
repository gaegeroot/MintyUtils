const BASEROW_API_URL = 'https://api.baserow.io/api/database/rows/table';
const CONTACTS_TABLE_ID = '743341';
const PROPERTIES_TABLE_ID = '743340';
import { BASEROW_TOKEN } from "$env/static/private";

export const actions = {
    createClient: async ({ request }) => {
        const data = await request.formData();

        const payload = {
            'First Name': data.get('firstName'),
            'Last Name': data.get('lastName'),
            'Email': data.get('email'),
            'Phone': data.get('phone'),

            'Status': 'Lead',
            'Lead Status': 'New',
            'Type': ['Residential'],

            'SMS Consent': data.get('smsConsent') === 'on',
            'Email Consent': true,
        };

        const res = await fetch(
            `${BASEROW_API_URL}/${CONTACTS_TABLE_ID}/?user_field_names=true`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Token ${BASEROW_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!res.ok) {
            const error = await res.json();
            console.error('Baserow error:', error);
            return {
                success: false,
                error: 'Failed to create contact'
            };
        }

        const createdRow = await res.json();

        return {
            success: true,
            clientId: createdRow.id
        };
    },

    createProperty: async ({ request }) => {
        const d = await request.formData();
        const has = (n) => d.has(n);

        // Helper to safely parse numbers
        const num = (v) => (v ? Number(v) : null);

        const payload = {
            // Address
            'Street Address': d.get('streetAddress') || '',
            City: d.get('city') || '',
            State: d.get('state') || '',
            Zip: num(d.get('zipcode')),

            // Meta
            Status: 4520770, // Lead
            Contact: d.get('clientId') ? [num(d.get('clientId'))] : [],

            // Property core
            'Property Type': num(d.get('propertyType')),
            Bedrooms: num(d.get('bedrooms')),
            Bathrooms: num(d.get('bathrooms')),
            Sqft: num(d.get('sqft')),

            // Schedule
            'Desired Schedule': num(d.get('desiredSchedule')),

            // Access & Floor
            'Access Difficulty': d.get('accessDifficulty') ? Number(d.get('accessDifficulty')) : null,
            'Floor / Level': num(d.get('floorLevel')),

            // Binary flags
            'Previously Cleaned Experience': has('firstTimeClean'), // Maps to Previous Cleaning Experience
            'Recently Cleaned (≤ 2 months)': has('recentClean'),
            'Smoke / Pests / Mold History': has('smokePestsMold'),
            'Move-in / Move-out': has('moveInOut'),
            'Pets Present': has('pets'),
            'Fragile / High-value Items / Clutter': has('fragileItems'),
            'Urgent Timeline (≤ 7 days)': has('urgentTimeline'),

            // Notes
            Notes: d.get('notes') || '',

            // Optional/Not in form — you may consider adding these later
            'Finished Basement': false,           // checkbox could be added
            'Ladder / High Reach Required': false, // checkbox could be added
        };

        try {
            const res = await fetch(
                `${BASEROW_API_URL}/743340/?user_field_names=true`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Token ${BASEROW_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                const err = await res.json();
                console.error('Baserow error:', err);
                return { success: false, error: err };
            }

            return { success: true };
        } catch (error) {
            console.error('Network error:', error);
            return { success: false, error };
        }
    }
};
