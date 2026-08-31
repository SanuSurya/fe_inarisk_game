<script>
	import { onMount } from 'svelte';
	import { Search, Swords, Trash2, Trophy, Users } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import Status from '$lib/components/Status.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { adminApi } from '$lib/api';
	import { disasterName, difficultyName, formatDate } from '$lib/constants';

	let quizDuels = $state([]);
	let adventureDuels = $state([]);
	let mode = $state('quiz');
	let status = $state('');
	let search = $state('');
	let currentPage = $state(1);
	let pageSize = $state(10);
	let loading = $state(true);
	let error = $state('');
	let deletingId = $state('');

	let records = $derived(mode === 'quiz' ? quizDuels : adventureDuels);
	let filtered = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase('id');
		return records.filter((duel) => {
			if (status && duel.status !== status) return false;
			if (!query) return true;
			return [
				duel.id,
				duel.challenger?.display_name,
				duel.challenger?.player_key,
				duel.opponent?.display_name,
				duel.opponent?.player_key,
				disasterName(duel.disaster_slug),
				duel.results?.map((result) => result.display_name).join(' ')
			]
				.join(' ')
				.toLocaleLowerCase('id')
				.includes(query);
		});
	});
	let paginated = $derived(filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize));

	onMount(async () => {
		try {
			[quizDuels, adventureDuels] = await Promise.all([
				adminApi.quizDuels(),
				adminApi.adventureDuels()
			]);
		} catch (cause) {
			error = `${cause.message}. Pastikan backend terbaru dan migration Adventure Multiplayer sudah dijalankan.`;
		} finally {
			loading = false;
		}
	});

	function switchMode(value) {
		mode = value;
		status = '';
		currentPage = 1;
	}

	function winner(duel) {
		if (duel.status !== 'completed' || duel.results?.length < 2) return null;
		const ordered = [...duel.results].sort((a, b) => {
			const aLost = mode === 'quiz' ? Boolean(a.forfeited) : Boolean(a.failed);
			const bLost = mode === 'quiz' ? Boolean(b.forfeited) : Boolean(b.failed);
			if (aLost !== bLost) return aLost ? 1 : -1;
			return b.score - a.score || a.duration_seconds - b.duration_seconds;
		});
		const [first, second] = ordered;
		if (first.score === second.score && first.duration_seconds === second.duration_seconds) {
			if (first.forfeited !== second.forfeited || first.failed !== second.failed) return first;
			return { display_name: 'Seri' };
		}
		return first;
	}

	function statusName(value) {
		return (
			{
				pending: 'Menunggu',
				accepted: 'Berlangsung',
				completed: 'Selesai',
				declined: 'Ditolak',
				cancelled: 'Dibatalkan',
				expired: 'Kedaluwarsa'
			}[value] || value
		);
	}

	function statusClass(value) {
		if (value === 'completed') return 'bg-emerald-100 text-emerald-700';
		if (value === 'accepted') return 'bg-blue-100 text-blue-700';
		if (value === 'pending') return 'bg-amber-100 text-amber-700';
		return 'bg-slate-100 text-slate-600';
	}

	function duration(seconds) {
		const value = Number(seconds || 0);
		return `${Math.floor(value / 60)}m ${value % 60}d`;
	}

	async function deleteDuel(duel) {
		if (duel.status !== 'cancelled' || deletingId) return;
		if (!confirm(`Hapus duel ${duel.challenger.display_name} vs ${duel.opponent.display_name}?`)) {
			return;
		}
		deletingId = duel.id;
		error = '';
		try {
			if (mode === 'quiz') {
				await adminApi.deleteQuizDuel(duel.id);
				quizDuels = quizDuels.filter((item) => item.id !== duel.id);
			} else {
				await adminApi.deleteAdventureDuel(duel.id);
				adventureDuels = adventureDuels.filter((item) => item.id !== duel.id);
			}
		} catch (cause) {
			error = cause.message;
		} finally {
			deletingId = '';
		}
	}
</script>

<AdminShell title="Hasil Duel">
	<div class="panel">
		<div class="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
			<div>
				<h2 class="flex items-center gap-2 text-lg font-bold">
					<Swords class="text-blue-600" size={22} aria-hidden="true" /> Riwayat Multiplayer
				</h2>
				<p class="mt-1 text-sm text-slate-500">
					Pantau peserta, pemenang, skor, waktu, dan objective setiap pertandingan.
				</p>
			</div>
			<div class="grid gap-3 sm:grid-cols-[minmax(16rem,1fr)_11rem]">
				<label>
					<span class="label">Cari duel</span>
					<span class="relative block">
						<Search
							class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
							size={18}
							aria-hidden="true"
						/>
						<input
							class="field field-with-icon"
							name="duel_search"
							type="search"
							autocomplete="off"
							placeholder="Cari pemain atau ID…"
							bind:value={search}
							oninput={() => (currentPage = 1)}
						/>
					</span>
				</label>
				<label>
					<span class="label">Status</span>
					<select
						class="field"
						name="duel_status"
						bind:value={status}
						onchange={() => (currentPage = 1)}
					>
						<option value="">Semua</option><option value="pending">Menunggu</option><option
							value="accepted">Berlangsung</option
						><option value="completed">Selesai</option><option value="declined">Ditolak</option
						><option value="cancelled">Dibatalkan</option><option value="expired"
							>Kedaluwarsa</option
						>
					</select>
				</label>
			</div>
		</div>

		<div class="mb-5 flex gap-2 border-b border-slate-200" role="tablist" aria-label="Jenis duel">
			<button
				class="duel-tab {mode === 'quiz' ? 'duel-tab-active' : ''}"
				role="tab"
				aria-selected={mode === 'quiz'}
				onclick={() => switchMode('quiz')}
				><Trophy size={17} aria-hidden="true" /> Duel Quiz
				<span class="numeric rounded-full bg-slate-100 px-2 py-0.5 text-xs">{quizDuels.length}</span
				></button
			>
			<button
				class="duel-tab {mode === 'adventure' ? 'duel-tab-active' : ''}"
				role="tab"
				aria-selected={mode === 'adventure'}
				onclick={() => switchMode('adventure')}
				><Users size={17} aria-hidden="true" /> Adventure Race
				<span class="numeric rounded-full bg-slate-100 px-2 py-0.5 text-xs"
					>{adventureDuels.length}</span
				></button
			>
		</div>

		{#if loading || error}
			<Status {loading} {error} />
		{:else if !filtered.length}
			<Status empty />
		{:else}
			<div class="table-wrap">
				<table>
					<thead
						><tr
							><th>Waktu</th><th>Pertandingan</th><th>Materi</th><th>Status</th><th>Pemenang</th><th
								>Hasil Pemain</th><th class="w-20 text-right">Aksi</th
							></tr
						></thead
					>
					<tbody>
						{#each paginated as duel}
							<tr>
								<td
									><strong>{formatDate(duel.completed_at || duel.created_at)}</strong>
									<div class="max-w-36 truncate text-xs text-slate-400" title={duel.id}>
										{duel.id}
									</div></td
								>
								<td
									><strong>{duel.challenger.display_name}</strong>
									<div class="text-xs text-slate-400">vs {duel.opponent.display_name}</div></td
								>
								<td
									>{disasterName(duel.disaster_slug)}{#if mode === 'quiz'}<div
											class="text-xs text-slate-400"
										>
											{difficultyName(duel.difficulty)}
										</div>{/if}</td
								>
								<td
									><span
										class="rounded-full px-2.5 py-1 text-xs font-semibold {statusClass(
											duel.status
										)}">{statusName(duel.status)}</span
									></td
								>
								<td
									>{#if winner(duel)}<strong class="text-emerald-700"
											>{winner(duel).display_name}</strong
										>{:else}<span class="text-slate-400">–</span>{/if}</td
								>
								<td class="min-w-80 whitespace-normal">
									{#if duel.results?.length}
										<div class="grid gap-2">
											{#each duel.results as result, index}
												<div class="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
													<div class="flex items-center justify-between gap-3">
														<strong class="min-w-0 truncate"
															>{index + 1}. {result.display_name}</strong
														><span class="numeric font-black text-blue-700"
															>{result.score} poin</span
														>
													</div>
												{#if mode === 'quiz'}<p class="mt-1 text-xs text-slate-500">
													{#if result.forfeited}<strong class="text-red-600">Mengundurkan diri</strong> • {/if}{result.correct_answers}/{result.total_questions} benar • {duration(
														result.duration_seconds
													)}
												</p>{:else}<p class="mt-1 text-xs break-words text-slate-500">
													{#if result.failed}<strong class="text-red-600">Keluar / gagal</strong> • {/if}
															Warga {result.survivors_rescued}/{result.total_survivors} • Kit {result.medical_kits}/{result.total_medical_kits}
															• Musuh {result.enemies_defeated}/{result.total_enemies} • {result.lives}
															nyawa • {duration(result.duration_seconds)}
														</p>{/if}
												</div>
											{/each}
										</div>
									{:else}<span class="text-slate-400">Belum ada hasil pemain</span>{/if}
								</td>
								<td class="text-right">
									{#if duel.status === 'cancelled'}
										<button
											class="btn btn-danger"
											disabled={deletingId === duel.id}
											onclick={() => deleteDuel(duel)}
											aria-label={`Hapus duel ${duel.challenger.display_name} melawan ${duel.opponent.display_name}`}
											><Trash2 size={16} aria-hidden="true" /> {deletingId === duel.id
												? 'Menghapus…'
												: 'Hapus'}</button
										>
									{:else}<span class="text-slate-300">–</span>{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<Pagination bind:page={currentPage} bind:pageSize total={filtered.length} label="duel" />
		{/if}
	</div>
</AdminShell>
