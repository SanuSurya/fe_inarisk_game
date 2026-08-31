<script>
	import { onMount } from 'svelte';
	import { Trash2, Search } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import Status from '$lib/components/Status.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { adminApi } from '$lib/api';
	import { formatDate } from '$lib/constants';
	let players = $state([]),
		loading = $state(true),
		error = $state(''),
		search = $state(''),
		page = $state(1),
		pageSize = $state(10);
	let filtered = $derived(
		players.filter((p) =>
			`${p.display_name || ''} ${p.email || ''} ${p.player_key}`
				.toLowerCase()
				.includes(search.toLowerCase())
		)
	);
	let paginated = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));
	async function load() {
		loading = true;
		try {
			players = await adminApi.players();
			page = 1;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
	onMount(load);
	async function remove(p) {
		if (!confirm(`Hapus pemain ${p.display_name || p.player_key} beserta seluruh progres dan log?`))
			return;
		try {
			await adminApi.deletePlayer(p.id);
			await load();
		} catch (e) {
			error = e.message;
		}
	}
</script>

<AdminShell title="Pemain">
	<div class="panel">
		<div class="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
			<div>
				<h2 class="font-bold">Daftar Pemain</h2>
				<p class="text-sm text-slate-500">Progres, skor, dan jumlah permainan.</p>
			</div>
			<label class="relative sm:w-72"
				><span class="sr-only">Cari pemain</span><Search
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
					size={18}
					aria-hidden="true"
				/><input
					class="field field-with-icon"
					name="player_search"
					autocomplete="off"
					bind:value={search}
					oninput={() => (page = 1)}
					placeholder="Cari pemain…"
				/></label
			>
		</div>
		{#if loading || error}<Status {loading} {error} />{:else if !filtered.length}<Status
				empty
			/>{:else}<div class="table-wrap">
				<table>
					<thead
						><tr
							><th>Pemain</th><th>High Score</th><th>Total Skor</th><th>Quiz</th><th>Adventure</th
							><th>Materi</th><th>Terakhir Aktif</th><th>Aksi</th></tr
						></thead
					><tbody
						>{#each paginated as p}<tr
								><td
									><strong>{p.display_name || 'Pemain INARISK'}</strong>
									<div class="text-xs text-slate-400">{p.email || p.player_key}</div></td
								><td class="numeric">{p.high_score}</td><td class="numeric">{p.total_score}</td><td
									class="numeric">{p.quiz_attempts}</td
								><td class="numeric">{p.adventure_sessions}</td><td>{p.completed_disasters}/6</td
								><td>{formatDate(p.updated_at)}</td><td
									><button
										class="btn btn-danger p-2"
										aria-label={`Hapus pemain ${p.display_name || p.player_key}`}
										title="Hapus pemain"
										onclick={() => remove(p)}><Trash2 size={16} aria-hidden="true" /></button
									></td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<Pagination bind:page bind:pageSize total={filtered.length} label="pemain" />{/if}
	</div>
</AdminShell>
