<script lang="js">
	export let data;
</script>

<svelte:head>
	<title>Authed</title>
	<meta name="description" content="Congratulations" />
</svelte:head>

<div class="text-column">
	<h1>Logged in as <strong>{data?.user.email}</strong> with a role of <strong>{data?.user.roles[0]}</strong></h1>

	<p>
		You can logout here: <a href="/api/auth/logout">Logout</a>
	</p>

	Here are all the user details: <pre>{JSON.stringify(data, null, 2)}</pre>

	With token : <pre>{JSON.stringify(data.props?.token, null, 2)}</pre>
</div>
