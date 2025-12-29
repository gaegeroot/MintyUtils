import { redirect } from "@sveltejs/kit";

export async function load({ locals, url }) {

    const user = locals.user;

    //   Optional: enforce a specific role
    if (!user.roles.includes('Admin')) {
        throw redirect(302, '/protected');
    }

    return {
        user,
        token: user ? locals.user.token : null
    };
}
