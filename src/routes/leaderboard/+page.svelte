<script>
	import { onMount } from 'svelte';
	import { Trophy, Medal, Search } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import Status from '$lib/components/Status.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { adminApi } from '$lib/api';
	import { disasters, difficulties, disasterName, difficultyName } from '$lib/constants';
	let entries = $state([]),
		loading = $state(true),
		error = $state(''),
		difficulty = $state(''),
		disaster = $state(''),
		search = $state(''),
		page = $state(1),
		pageSize = $state(10);
	let filtered = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase('id');
		if (!query) return entries;
		return entries.filter((entry) =>
			`${entry.display_name || ''} ${entry.player_key || ''}`
				.toLocaleLowerCase('id')
				.includes(query)
		);
	});
	let paginated = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));
	async function load() {
		loading = true;
		error = '';
		try {
			entries = await adminApi.leaderboard({
				...(difficulty && { difficulty }),
				...(disaster && { disaster_slug: disaster })
			});
			page = 1;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
	function formatDuration(totalSeconds) {
		const seconds = Number(totalSeconds || 0);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainder = seconds % 60;
		return hours > 0 ? `${hours}j ${minutes}m ${remainder}d` : `${minutes}m ${remainder}d`;
	}
	onMount(load);
</script>

<AdminShell title="Peringkat Pemain">
	<div class="panel">
		<div class="mb-5 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-end">
			<div>
				<h2 class="flex items-center gap-2 font-bold">
					<Trophy class="text-amber-500" aria-hidden="true" /> Peringkat Quiz
				</h2>
				<p class="text-sm text-slate-500">
					Akumulasi skor terbaik tiap bencana dan level; waktu tercepat menjadi pembeda.
				</p>
			</div>
			<div class="grid gap-3 sm:grid-cols-3">
				<label>
					<span class="label">Cari pemain</span>
					<span class="relative block">
						<Search
							class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
							size={18}
							aria-hidden="true"
						/>
						<input
							class="field field-with-icon"
							name="leaderboard_search"
							type="search"
							autocomplete="off"
							placeholder="Cari pemain…"
							bind:value={search}
							oninput={() => (page = 1)}
						/>
					</span>
				</label>
				<label
					><span class="label">Bencana</span><select
						class="field"
						name="leaderboard_disaster"
						bind:value={disaster}
						onchange={load}
						><option value="">Semua</option>{#each disasters as [id, name]}<option value={id}
								>{name}</option
							>{/each}</select
					></label
				><label
					><span class="label">Level</span><select
						class="field"
						name="leaderboard_difficulty"
						bind:value={difficulty}
						onchange={load}
						><option value="">Semua</option>{#each difficulties as [id, name]}<option value={id}
								>{name}</option
							>{/each}</select
					></label
				>
			</div>
		</div>
		{#if loading || error}<Status {loading} {error} />{:else if !filtered.length}<Status
				empty
			/>{:else}<div class="grid gap-3">
				{#each paginated as entry}<article
						class="flex items-center gap-4 rounded-xl border p-4 {entry.rank <= 3
							? 'border-amber-200 bg-amber-50'
							: 'border-slate-200 bg-white'}"
					>
						<div
							class="grid h-11 w-11 place-items-center rounded-full {entry.rank === 1
								? 'bg-amber-400'
								: entry.rank === 2
									? 'bg-slate-300'
									: entry.rank === 3
										? 'bg-orange-300'
										: 'bg-slate-100'}"
						>
							{#if entry.rank <= 3}<Medal size={22} aria-hidden="true" /><span class="sr-only"
									>Peringkat {entry.rank}</span
								>{:else}<strong>#{entry.rank}</strong>{/if}
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="truncate font-bold">{entry.display_name}</h3>
							<p class="text-xs text-slate-500">
								{entry.attempts} permainan • total waktu {formatDuration(
									entry.total_duration_seconds
								)}
							</p>
						</div>
						<strong class="numeric text-xl text-blue-700" aria-label={`${entry.total_score} poin`}
							>{entry.total_score}</strong
						>
					</article>{/each}
			</div>
			<Pagination bind:page bind:pageSize total={filtered.length} label="pemain" />{/if}
	</div>
</AdminShell>
