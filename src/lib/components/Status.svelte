<script>
	let { loading = false, error = '', empty = false } = $props();
</script>

{#if loading}<div class="panel py-16 text-center text-slate-500" role="status" aria-live="polite">
		<span
			class="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
			aria-hidden="true"
		></span>
		Memuat data…
	</div>
{:else if error}<div
		class="panel border-red-200 bg-red-50 py-10 text-center text-red-700"
		role="alert"
	>
		{error}
	</div>
{:else if empty}<div class="panel py-16 text-center text-slate-500" role="status">
		Belum ada data.
	</div>{/if}
