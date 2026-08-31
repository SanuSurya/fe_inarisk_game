<script>
	import { onMount } from 'svelte';
	import { Plus, Pencil, Trash2, Save, X, Search } from '@lucide/svelte';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import Status from '$lib/components/Status.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { adminApi } from '$lib/api';
	import { disasters, difficulties, disasterName, difficultyName } from '$lib/constants';

	let questions = $state([]),
		configs = $state([]),
		loading = $state(true),
		error = $state('');
	let filterDisaster = $state(''),
		filterDifficulty = $state(''),
		search = $state(''),
		currentPage = $state(1),
		pageSize = $state(10),
		modal = $state(false),
		editing = $state(null);
	let filteredQuestions = $derived.by(() => {
		const query = search.trim().toLocaleLowerCase('id');
		if (!query) return questions;
		return questions.filter((question) =>
			[
				question.question_id,
				question.question_en,
				...question.options_id,
				...question.options_en,
				disasterName(question.disaster_slug),
				difficultyName(question.difficulty)
			]
				.join(' ')
				.toLocaleLowerCase('id')
				.includes(query)
		);
	});
	let paginatedQuestions = $derived(
		filteredQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);
	function truncateText(value, maxLength) {
		if (!value || value.length <= maxLength) return value;
		return `${value.slice(0, maxLength).trimEnd()}…`;
	}

	async function changeFilters() {
		currentPage = 1;
		await load();
	}
	let form = $state(emptyForm());
	function emptyForm() {
		return {
			disaster_slug: 'banjir',
			difficulty: 'easy',
			question_id: '',
			question_en: '',
			options_id: ['', '', '', ''],
			options_en: ['', '', '', ''],
			correct_answer: 0,
			sort_order: 0,
			is_enabled: true
		};
	}
	async function load() {
		loading = true;
		error = '';
		try {
			questions = await adminApi.questions({
				...(filterDisaster && { disaster_slug: filterDisaster }),
				...(filterDifficulty && { difficulty: filterDifficulty })
			});
			currentPage = 1;
			configs = await adminApi.difficulties();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
	onMount(load);
	function openCreate() {
		editing = null;
		form = emptyForm();
		modal = true;
	}
	function openEdit(q) {
		editing = q;
		form = { ...q, options_id: [...q.options_id], options_en: [...q.options_en] };
		modal = true;
	}
	async function save(event) {
		event.preventDefault();
		error = '';
		try {
			if (editing) await adminApi.updateQuestion(editing.id, form);
			else await adminApi.createQuestion(form);
			modal = false;
			await load();
		} catch (e) {
			error = e.message;
		}
	}
	async function remove(q) {
		if (!confirm(`Hapus pertanyaan "${q.question_id}"?`)) return;
		try {
			await adminApi.deleteQuestion(q.id);
			await load();
		} catch (e) {
			error = e.message;
		}
	}
	async function saveConfig(config) {
		try {
			await adminApi.updateDifficulty(config.difficulty, {
				question_count: Number(config.question_count),
				points_per_correct: Number(config.points_per_correct),
				time_limit_seconds: config.time_limit_seconds ? Number(config.time_limit_seconds) : null,
				is_enabled: config.is_enabled
			});
			await load();
		} catch (e) {
			error = e.message;
		}
	}
</script>

<AdminShell title="Pertanyaan & Level Quiz">
	<section class="panel mb-6" aria-labelledby="difficulty-settings-title">
		<div class="mb-4">
			<h2 id="difficulty-settings-title" class="font-bold">Pengaturan Level</h2>
			<p class="text-sm text-slate-500">
				Atur jumlah soal, poin, batas waktu per soal, dan status.
			</p>
		</div>
		<div class="grid gap-4 lg:grid-cols-3">
			{#each configs as config}<div class="rounded-xl border border-slate-200 p-4">
					<h3 class="mb-3 font-bold">{difficultyName(config.difficulty)}</h3>
					<div class="grid grid-cols-2 gap-3">
						<label
							><span class="label">Jumlah soal</span><input
								class="field"
								name={`question_count_${config.difficulty}`}
								type="number"
								min="1"
								bind:value={config.question_count}
							/></label
						><label
							><span class="label">Poin benar</span><input
								class="field"
								name={`points_${config.difficulty}`}
								type="number"
								min="1"
								bind:value={config.points_per_correct}
							/></label
						><label
							><span class="label">Waktu (detik)</span><input
								class="field"
								name={`time_limit_${config.difficulty}`}
								type="number"
								min="1"
								placeholder="Tanpa batas"
								bind:value={config.time_limit_seconds}
							/></label
						><label class="flex items-end gap-2 pb-2"
							><input
								name={`enabled_${config.difficulty}`}
								type="checkbox"
								bind:checked={config.is_enabled}
							/> Aktif</label
						>
					</div>
					<button class="btn btn-primary mt-3 w-full" onclick={() => saveConfig(config)}
						><Save size={16} aria-hidden="true" /> Simpan Level</button
					>
				</div>{/each}
		</div>
	</section>
	<section class="panel" aria-labelledby="questions-title">
		<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
			<div class="grid w-full gap-3 md:w-auto md:grid-cols-[minmax(16rem,1fr)_auto_auto]">
				<h2 id="questions-title" class="sr-only">Bank Pertanyaan</h2>
				<label>
					<span class="label">Cari pertanyaan</span>
					<span class="relative block">
						<Search
							class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
							size={18}
							aria-hidden="true"
						/>
						<input
							class="field field-with-icon"
							name="question_search"
							type="search"
							autocomplete="off"
							placeholder="Cari soal atau jawaban…"
							bind:value={search}
							oninput={() => (currentPage = 1)}
						/>
					</span>
				</label>
				<label
					><span class="label">Bencana</span><select
						class="field"
						name="filter_disaster"
						bind:value={filterDisaster}
						onchange={changeFilters}
						><option value="">Semua</option>{#each disasters as [id, name]}<option value={id}
								>{name}</option
							>{/each}</select
					></label
				><label
					><span class="label">Level</span><select
						class="field"
						name="filter_difficulty"
						bind:value={filterDifficulty}
						onchange={changeFilters}
						><option value="">Semua</option>{#each difficulties as [id, name]}<option value={id}
								>{name}</option
							>{/each}</select
					></label
				>
			</div>
			<button class="btn btn-primary w-full sm:w-auto" onclick={openCreate}
				><Plus size={17} aria-hidden="true" /> Tambah Pertanyaan</button
			>
		</div>
		{#if loading || error}<Status {loading} {error} />{:else if !filteredQuestions.length}<Status
				empty
			/>{:else}<div class="table-wrap">
				<table class="min-w-240 table-fixed">
					<colgroup>
						<col class="w-96" />
						<col class="w-40" />
						<col class="w-28" />
						<col class="w-64" />
						<col class="w-28" />
						<col class="w-28" />
					</colgroup>
					<thead
						><tr
							><th>Pertanyaan</th><th>Bencana</th><th>Level</th><th>Jawaban</th><th>Status</th><th
								>Aksi</th
							></tr
						></thead
					><tbody
						>{#each paginatedQuestions as q}<tr
								><td class="overflow-hidden"
									><strong
										class="block truncate leading-5"
										title={q.question_id}
										aria-label={q.question_id}>{truncateText(q.question_id, 80)}</strong
									>
									<div
										class="mt-1 truncate text-xs text-slate-400"
										title={q.question_en}
										aria-label={q.question_en}
									>
										{truncateText(q.question_en, 72)}
									</div></td
								><td>{disasterName(q.disaster_slug)}</td><td>{difficultyName(q.difficulty)}</td><td
									class="max-w-64 overflow-hidden text-ellipsis"
									title={q.options_id[q.correct_answer]}
									aria-label={q.options_id[q.correct_answer]}
									>{truncateText(q.options_id[q.correct_answer], 42)}</td
								><td
									><span
										class="rounded-full px-2 py-1 text-xs {q.is_enabled
											? 'bg-emerald-100 text-emerald-700'
											: 'bg-slate-100 text-slate-500'}">{q.is_enabled ? 'Aktif' : 'Nonaktif'}</span
									></td
								><td
									><div class="flex gap-2">
										<button
											class="btn btn-muted p-2"
											aria-label={`Edit pertanyaan ${q.question_id}`}
											title="Edit pertanyaan"
											onclick={() => openEdit(q)}><Pencil size={16} aria-hidden="true" /></button
										><button
											class="btn btn-danger p-2"
											aria-label={`Hapus pertanyaan ${q.question_id}`}
											title="Hapus pertanyaan"
											onclick={() => remove(q)}><Trash2 size={16} aria-hidden="true" /></button
										>
									</div></td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<Pagination
				bind:page={currentPage}
				bind:pageSize
				total={filteredQuestions.length}
				label="pertanyaan"
			/>{/if}
	</section>
</AdminShell>

{#if modal}<div
		class="fixed inset-0 z-50 grid place-items-center overflow-y-auto overscroll-contain bg-black/50 p-4"
		role="presentation"
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="question-dialog-title"
			class="my-6 max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl"
		>
			<form onsubmit={save} class="p-4 sm:p-6">
				<div class="mb-5 flex items-center justify-between">
					<h2 id="question-dialog-title" class="text-xl font-bold">
						{editing ? 'Edit' : 'Tambah'} Pertanyaan
					</h2>
					<button
						type="button"
						class="btn btn-muted p-2"
						aria-label="Tutup formulir pertanyaan"
						onclick={() => (modal = false)}><X size={20} aria-hidden="true" /></button
					>
				</div>
				<div class="grid gap-4 md:grid-cols-2">
					<label
						><span class="label">Jenis Bencana</span><select
							class="field"
							name="disaster_slug"
							bind:value={form.disaster_slug}
							>{#each disasters as [id, name]}<option value={id}>{name}</option>{/each}</select
						></label
					><label
						><span class="label">Level Quiz</span><select
							class="field"
							name="difficulty"
							bind:value={form.difficulty}
							>{#each difficulties as [id, name]}<option value={id}>{name}</option>{/each}</select
						></label
					><label class="md:col-span-2"
						><span class="label">Pertanyaan Indonesia</span><textarea
							class="field"
							name="question_id"
							rows="2"
							bind:value={form.question_id}
							required
						></textarea></label
					><label class="md:col-span-2"
						><span class="label">Pertanyaan Inggris</span><textarea
							class="field"
							name="question_en"
							rows="2"
							bind:value={form.question_en}
							required
						></textarea></label
					>{#each form.options_id as option, i}<label
							><span class="label">Pilihan {i + 1} (ID)</span><input
								class="field"
								name={`option_id_${i + 1}`}
								bind:value={form.options_id[i]}
								required
							/></label
						><label
							><span class="label">Option {i + 1} (EN)</span><input
								class="field"
								name={`option_en_${i + 1}`}
								bind:value={form.options_en[i]}
								required
							/></label
						>{/each}<label
						><span class="label">Jawaban Benar</span><select
							class="field"
							name="correct_answer"
							bind:value={form.correct_answer}
							>{#each form.options_id as _, i}<option value={i}>Pilihan {i + 1}</option
								>{/each}</select
						></label
					><label class="flex items-center gap-2"
						><input name="is_enabled" type="checkbox" bind:checked={form.is_enabled} /> Pertanyaan aktif</label
					>
				</div>
				{#if error}<p class="mt-3 text-red-600" role="alert">{error}</p>{/if}
				<div class="mt-6 flex justify-end gap-3">
					<button type="button" class="btn btn-muted" onclick={() => (modal = false)}>Batal</button
					><button class="btn btn-primary"><Save size={17} aria-hidden="true" /> Simpan</button>
				</div>
			</form>
		</div>
	</div>{/if}
