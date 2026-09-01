<script>
	import { onMount } from 'svelte';
	import { Users, CircleHelp, BrainCircuit, Gamepad2, Radio, Trophy } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import HorizontalBarChart from '$lib/components/HorizontalBarChart.svelte';
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
						'text-violet-600 bg-violet-50',
						`dari ${data.adventure_players ?? 0} pemain`
					],
					['Adventure Berlangsung', data.active_adventure_duels, Radio, 'text-rose-600 bg-rose-50'],
					['Skor Quiz Terbaik', data.best_quiz_score, Trophy, 'text-amber-600 bg-amber-50']
				]
			: []
	);
</script>

<AdminShell title="Dashboard">
	{#if loading || error}<Status {loading} {error} />{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{#each cards as [label, value, Icon, color, detail]}<div
					class="panel flex items-center gap-4"
				>
					<div class="rounded-xl p-3 {color}"><Icon size={25} aria-hidden="true" /></div>
					<div class="min-w-0">
						<p class="numeric text-2xl font-black text-slate-900">{value}</p>
						<p class="text-xs text-slate-500">{label}</p>
						{#if detail}<p class="mt-0.5 text-xs font-semibold text-slate-700">{detail}</p>{/if}
					</div>
				</div>{/each}
		</div>
		<div class="mt-6 grid gap-5 xl:grid-cols-3">
			<HorizontalBarChart
				title="Pemain Paling Aktif"
				description="Berdasarkan total sesi Quiz, Adventure, dan hasil duel yang tercatat."
				items={data.charts?.active_players ?? []}
				unit="aktivitas"
				color="#3b82f6"
			/>
			<HorizontalBarChart
				title="Skor Quiz Tertinggi"
				description="Akumulasi skor terbaik pemain pada setiap materi dan tingkat kesulitan."
				items={data.charts?.top_scores ?? []}
				unit="poin"
				color="#f59e0b"
			/>
			<HorizontalBarChart
				title="Juara Multiplayer"
				description="Pemain dengan kemenangan terbanyak dari duel Quiz dan Adventure."
				items={data.charts?.multiplayer_winners ?? []}
				unit="menang"
				color="#10b981"
			/>
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
