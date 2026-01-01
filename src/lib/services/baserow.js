import { BASEROW_TOKEN } from '$env/static/private';

const BASEROW_API_URL = 'https://api.baserow.io/api/database/rows/table';
const CONTACTS_TABLE_ID = '743341';
const PROPERTIES_TABLE_ID = '743340';
const JOBS_TABLE_ID = '743343';

async function baserowRequest(tableId, options = {}) {
    const { method = 'GET', body, id } = options;
    
    const url = id 
        ? `${BASEROW_API_URL}/${tableId}/${id}/?user_field_names=true`
        : `${BASEROW_API_URL}/${tableId}/?user_field_names=true`;
    
    const res = await fetch(url, {
        method,
        headers: {
            Authorization: `Token ${BASEROW_TOKEN}`,
            'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) }),
    });
    
    if (!res.ok) {
        const error = await res.json();
        throw new Error(`Baserow error: ${JSON.stringify(error)}`);
    }
    
    return res.json();
}

export const baserowService = {
    contacts: {
        create: async (data) => {
            return baserowRequest(CONTACTS_TABLE_ID, {
                method: 'POST',
                body: data,
            });
        },
        get: async (id) => {
            return baserowRequest(CONTACTS_TABLE_ID, { id });
        },
        update: async (id, data) => {
            return baserowRequest(CONTACTS_TABLE_ID, {
                method: 'PATCH',
                id,
                body: data,
            });
        },
    },
    
    properties: {
        create: async (data) => {
            return baserowRequest(PROPERTIES_TABLE_ID, {
                method: 'POST',
                body: data,
            });
        },
        get: async (id) => {
            return baserowRequest(PROPERTIES_TABLE_ID, { id });
        },
    },
    
    jobs: {
        create: async (data) => {
            return baserowRequest(JOBS_TABLE_ID, {
                method: 'POST',
                body: data,
            });
        },
        get: async (id) => {
            return baserowRequest(JOBS_TABLE_ID, { id });
        },
    },
};