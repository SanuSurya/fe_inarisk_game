<script>
	import { onMount } from 'svelte';
	import { Medal, Search, Swords } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import Status from '$lib/components/Status.svelte';
	import { adminApi } from '$lib/api';

	let entries = $state([]);
	let loading = $state(true);
	let error = $state('');
	let search = $state('');
	let page = $state(1);
	let pageSize = $state(10);
	let filtered = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase('id');
		if (!query) return entries;
		return entries.filter((entry) =>
			`${entry.display_name} ${entry.player_key}`.toLocaleLowerCase('id').includes(query)
		);
	});
	let paginated = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));

	onMount(async () => {
		try {
			entries = await adminApi.multiplayerLeaderboard();
		} catch (cause) {
			error = cause.message;
		} finally {
			loading = false;
		}
	});
</script>

<AdminShell title="Peringkat Multiplayer">
	<div class="panel">
		<div class="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div>
				<h2 class="flex items-center gap-2 text-lg font-bold">
					<Swords class="text-blue-600" size={22} aria-hidden="true" /> Pemain Paling Sering Menang
				</h2>
				<p class="mt-1 text-sm text-slate-500">
					Akumulasi kemenangan duel Quiz dan Adventure Race yang sudah selesai.
				</p>
			</div>
			<label class="w-full md:max-w-xs">
				<span class="label">Cari pemain</span>
				<span class="relative block">
					<Search class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
					<input class="field field-with-icon" type="search" name="multiplayer_ranking_search" autocomplete="off" placeholder="Nama atau ID pemain…" bind:value={search} oninput={() => (page = 1)} />
				</span>
			</label>
		</div>

		{#if loading || error}
			<Status {loading} {error} />
		{:else if !filtered.length}
			<Status empty />
		{:else}
			<div class="table-wrap">
				<table>
					<thead><tr><th>Peringkat</th><th>Pemain</th><th>Main</th><th>Menang</th><th>Quiz</th><th>Adventure</th><th>Kalah</th><th>Seri</th><th>Win Rate</th></tr></thead>
					<tbody>
						{#each paginated as entry}
							<tr class={entry.rank <= 3 ? 'bg-amber-50/60' : ''}>
								<td><span class="inline-flex items-center gap-2 font-black">{#if entry.rank <= 3}<Medal class="text-amber-500" size={19} aria-hidden="true" />{/if}#{entry.rank}</span></td>
								<td><strong>{entry.display_name}</strong><div class="max-w-52 truncate text-xs text-slate-400" title={entry.player_key}>{entry.player_key}</div></td>
								<td class="numeric">{entry.matches}</td>
								<td class="numeric font-black text-emerald-700">{entry.wins}</td>
								<td class="numeric">{entry.quiz_wins}</td>
								<td class="numeric">{entry.adventure_wins}</td>
								<td class="numeric text-red-600">{entry.losses}</td>
								<td class="numeric">{entry.draws}</td>
								<td><strong class="numeric text-blue-700">{Number(entry.win_rate).toFixed(1)}%</strong></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<Pagination bind:page bind:pageSize total={filtered.length} label="pemain" />
		{/if}
	</div>
</AdminShell>
