<script>
	import { onMount } from 'svelte';
	import { Users, CircleHelp, BrainCircuit, Gamepad2, Trophy } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import Status from '$lib/components/Status.svelte';
	import { adminApi } from '$lib/api';

	let data = $state(null);
	let error = $state('');
	let loading = $state(true);
	onMount(async () => {
		try {
			data = await adminApi.dashboard();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});
	const cards = $derived(
		data
			? [
					['Total Pemain', data.players, Users, 'text-blue-600 bg-blue-50'],
					['Soal Aktif', data.active_questions, CircleHelp, 'text-emerald-600 bg-emerald-50'],
					['Quiz Dimainkan', data.quiz_attempts, BrainCircuit, 'text-orange-600 bg-orange-50'],
					[
						'Adventure Dimainkan',
						data.adventure_sessions,
						Gamepad2,
						'text-violet-600 bg-violet-50'
					],
					['Skor Quiz Terbaik', data.best_quiz_score, Trophy, 'text-amber-600 bg-amber-50']
				]
			: []
	);
</script>

<AdminShell title="Dashboard">
	{#if loading || error}<Status {loading} {error} />{:else}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
			{#each cards as [label, value, Icon, color]}<div class="panel flex items-center gap-4">
					<div class="rounded-xl p-3 {color}"><Icon size={25} aria-hidden="true" /></div>
					<div class="min-w-0">
						<p class="numeric text-2xl font-black text-slate-900">{value}</p>
						<p class="text-xs text-slate-500">{label}</p>
					</div>
				</div>{/each}
		</div>
		<div class="panel mt-6">
			<h2 class="text-lg font-bold">Administrasi Game</h2>
			<p class="mt-2 text-sm leading-6 text-slate-600">
				Kelola bank soal dan tingkat kesulitan, pantau pemain, audit log permainan, serta lihat
				peringkat Quiz dari satu panel.
			</p>
		</div>
	{/if}
</AdminShell>
