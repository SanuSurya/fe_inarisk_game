<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { clearAdminKey, getAdminKey } from '$lib/api';
	import { onMount } from 'svelte';
	import {
		LayoutDashboard,
		CircleHelp,
		Users,
		ScrollText,
		Trophy,
		Swords,
		Menu,
		X,
		LogOut
	} from '@lucide/svelte';

	let { children, title } = $props();
	let open = $state(false);
	const items = [
		['/dashboard', 'Dashboard', LayoutDashboard],
		['/questions', 'Pertanyaan & Level', CircleHelp],
		['/players', 'Pemain', Users],
		['/logs', 'Log Pemain', ScrollText],
		['/duels', 'Hasil Duel', Swords],
		['/leaderboard', 'Peringkat', Trophy]
	];

	onMount(() => {
		if (!getAdminKey()) goto(`${base}/`);
	});
	function logout() {
		clearAdminKey();
		goto(`${base}/`);
	}
</script>

<a class="skip-link" href="#main-content">Lewati ke konten utama</a>
<div class="min-h-screen">
	{#if open}<button
			aria-label="Tutup menu"
			class="fixed inset-0 z-30 bg-black/40 lg:hidden"
			onclick={() => (open = false)}
		></button>{/if}
	<aside
		id="admin-sidebar"
		class="fixed inset-y-0 left-0 z-40 flex h-dvh w-68 flex-col overflow-hidden bg-slate-950 text-white transition-transform lg:translate-x-0 {open
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="flex h-20 items-center justify-between border-b border-white/10 px-5">
			<div>
				<strong class="text-lg">INARISK Games</strong>
				<div class="text-xs text-blue-300">ADMINISTRATOR</div>
			</div>
			<button
				class="rounded-lg p-2 hover:bg-white/10 lg:hidden"
				aria-label="Tutup menu navigasi"
				onclick={() => (open = false)}><X size={22} aria-hidden="true" /></button
			>
		</div>
		<nav class="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
			{#each items as [href, label, Icon]}
				<a
					href={`${base}${href}`}
					onclick={() => (open = false)}
					class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition {page.url.pathname.endsWith(
						href
					)
						? 'bg-blue-600 text-white'
						: 'text-slate-300 hover:bg-white/10 hover:text-white'}"
					aria-current={page.url.pathname.endsWith(href) ? 'page' : undefined}
				>
					<Icon size={19} aria-hidden="true" />
					{label}
				</a>
			{/each}
		</nav>
	</aside>
	<main id="main-content" class="min-w-0 lg:ml-68" tabindex="-1">
		<header
			class="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7"
		>
			<div class="flex items-center gap-3">
				<button
					class="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
					aria-label="Buka menu navigasi"
					aria-controls="admin-sidebar"
					aria-expanded={open}
					onclick={() => (open = true)}><Menu size={24} aria-hidden="true" /></button
				>
				<div>
					<h1 class="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
					<p class="hidden text-xs text-slate-500 sm:block">Panel Administrasi INARISK Games</p>
				</div>
			</div>
			<button class="btn btn-muted" onclick={logout} aria-label="Keluar dari panel admin"
				><LogOut size={17} aria-hidden="true" />
				<span class="hidden sm:inline">Keluar</span></button
			>
		</header>
		<div class="p-4 sm:p-7">{@render children()}</div>
	</main>
</div>
