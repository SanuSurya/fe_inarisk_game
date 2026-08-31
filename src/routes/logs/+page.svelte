<script>
	import { onMount } from 'svelte';
	import { Search } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import Status from '$lib/components/Status.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { adminApi } from '$lib/api';
	import { disasterName, difficultyName, formatDate } from '$lib/constants';
	let logs = $state([]),
		loading = $state(true),
		error = $state(''),
		mode = $state(''),
		search = $state(''),
		page = $state(1),
		pageSize = $state(10);
	let filtered = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase('id');
		return logs.filter((log) => {
			if (mode && log.mode !== mode) return false;
			if (!query) return true;
			return [
				log.display_name,
				log.player_key,
				log.mode,
				disasterName(log.disaster_slug),
				log.difficulty ? difficultyName(log.difficulty) : '',
				log.score,
				log.detail
			]
				.join(' ')
				.toLocaleLowerCase('id')
				.includes(query);
		});
	});
	let paginated = $derived(filtered.slice((page - 1) * pageSize, page * pageSize));
	onMount(async () => {
		try {
			logs = await adminApi.logs();
			page = 1;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	});
</script>

<AdminShell title="Log Pemain">
	<div class="panel">
		<div class="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-end">
			<div>
				<h2 class="font-bold">Riwayat Permainan</h2>
				<p class="text-sm text-slate-500">Audit hasil Quiz dan sesi Adventure terbaru.</p>
			</div>
			<div class="grid gap-3 sm:grid-cols-[minmax(16rem,1fr)_12rem]">
				<label>
					<span class="label">Cari log</span>
					<span class="relative block">
						<Search
							class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
							size={18}
							aria-hidden="true"
						/>
						<input
							class="field field-with-icon"
							name="log_search"
							type="search"
							autocomplete="off"
							placeholder="Cari pemain atau detail…"
							bind:value={search}
							oninput={() => (page = 1)}
						/>
					</span>
				</label>
				<label
					><span class="label">Mode</span><select
						class="field"
						name="log_mode"
						bind:value={mode}
						onchange={() => (page = 1)}
						><option value="">Semua</option><option value="quiz">Quiz</option><option
							value="adventure">Adventure</option
						></select
					></label
				>
			</div>
		</div>
		{#if loading || error}<Status {loading} {error} />{:else if !filtered.length}<Status
				empty
			/>{:else}<div class="table-wrap">
				<table>
					<thead
						><tr
							><th>Waktu</th><th>Pemain</th><th>Mode</th><th>Bencana</th><th>Level</th><th>Skor</th
							><th>Durasi</th><th>Detail</th></tr
						></thead
					><tbody
						>{#each paginated as log}<tr
								><td>{formatDate(log.occurred_at)}</td><td
									><strong>{log.display_name}</strong>
									<div class="text-xs text-slate-400">{log.player_key}</div></td
								><td
									><span
										class="rounded-full px-2 py-1 text-xs {log.mode === 'quiz'
											? 'bg-orange-100 text-orange-700'
											: 'bg-blue-100 text-blue-700'}">{log.mode}</span
									></td
								><td>{disasterName(log.disaster_slug)}</td><td
									>{log.difficulty ? difficultyName(log.difficulty) : '-'}</td
								><td class="numeric">{log.score}</td><td class="numeric">{log.duration_seconds}s</td
								><td>{log.detail}</td></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<Pagination bind:page bind:pageSize total={filtered.length} label="log" />{/if}
	</div>
</AdminShell>
