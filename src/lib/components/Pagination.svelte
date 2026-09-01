<script>
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	let { page = $bindable(1), pageSize = $bindable(10), total = 0, label = 'data' } = $props();
	const pageSizes = [10, 25, 50, 100];
	let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	let pageNumbers = $derived(buildPageNumbers(totalPages, page));

	$effect(() => {
		if (page > totalPages) page = totalPages;
	});

	function buildPageNumbers(totalCount, active) {
		if (totalCount <= 7) return Array.from({ length: totalCount }, (_, index) => index + 1);
		const pages = new Set([1, totalCount, active - 1, active, active + 1]);
		const validPages = [...pages]
			.filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalCount)
			.sort((a, b) => a - b);
		const result = [];
		for (const pageNumber of validPages) {
			if (result.length && pageNumber - result.at(-1) > 1) result.push('ellipsis');
			result.push(pageNumber);
		}
		return result;
	}
</script>

{#if total > 0}
	<div class="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<label class="flex items-center gap-2 text-sm text-slate-600">
				<span>Tampilkan</span>
				<select
					class="field w-24 py-1.5"
					name="page_size"
					aria-label={`Jumlah ${label} per halaman`}
					bind:value={pageSize}
					onchange={() => (page = 1)}
				>
					{#each pageSizes as size}<option value={size}>{size}</option>{/each}
				</select>
				<span>{label}</span>
			</label>
			<p class="text-sm text-slate-500" aria-live="polite">
				<span class="numeric font-semibold text-slate-700"
					>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span
				>
				dari <span class="numeric font-semibold text-slate-700">{total}</span>
			</p>
		</div>
		<nav
			class="flex max-w-full items-center gap-1 overflow-x-auto pb-1"
			aria-label={`Pagination ${label}`}
		>
			<button
				class="btn btn-muted min-w-10 px-2"
				aria-label="Halaman sebelumnya"
				disabled={page === 1}
				onclick={() => (page -= 1)}><ChevronLeft size={18} aria-hidden="true" /></button
			>
			{#each pageNumbers as pageNumber}
				{#if pageNumber === 'ellipsis'}
					<span class="grid min-w-8 place-items-center text-slate-400" aria-hidden="true">…</span>
				{:else}
					<button
						class="btn min-w-10 px-3 {page === pageNumber ? 'btn-primary' : 'btn-muted'}"
						aria-label={`Halaman ${pageNumber}`}
						aria-current={page === pageNumber ? 'page' : undefined}
						onclick={() => (page = pageNumber)}>{pageNumber}</button
					>
				{/if}
			{/each}
			<button
				class="btn btn-muted min-w-10 px-2"
				aria-label="Halaman berikutnya"
				disabled={page === totalPages}
				onclick={() => (page += 1)}><ChevronRight size={18} aria-hidden="true" /></button
			>
		</nav>
	</div>
{/if}
