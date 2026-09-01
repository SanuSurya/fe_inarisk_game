<script>
	let { title, description, items = [], unit, barClass = 'bg-blue-500' } = $props();

	const maximum = $derived(Math.max(...items.map((item) => Number(item.value) || 0), 1));
</script>

<section
	class="panel min-w-0"
	aria-labelledby={`${title.replaceAll(' ', '-').toLowerCase()}-title`}
>
	<div>
		<h2
			id={`${title.replaceAll(' ', '-').toLowerCase()}-title`}
			class="text-base font-bold text-slate-900"
		>
			{title}
		</h2>
		<p class="mt-1 text-xs leading-5 text-slate-500">{description}</p>
	</div>

	{#if items.length === 0}
		<p class="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
			Belum ada data untuk ditampilkan.
		</p>
	{:else}
		<ol class="mt-5 space-y-4">
			{#each items as item, index}
				<li>
					<div class="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
						<span class="min-w-0 truncate font-medium text-slate-700" title={item.label}>
							{index + 1}. {item.label}
						</span>
						<span class="numeric shrink-0 font-bold text-slate-900">{item.value} {unit}</span>
					</div>
					<div class="h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
						<div
							class="h-full rounded-full {barClass}"
							style={`width: ${Math.max((Number(item.value) / maximum) * 100, 3)}%`}
						></div>
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</section>
