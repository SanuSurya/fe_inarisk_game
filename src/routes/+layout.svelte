<script>
	import './app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Admin INARISK Games</title>
	<meta name="description" content="Panel administrasi INARISK Games" />
</svelte:head>

{@render children()}
