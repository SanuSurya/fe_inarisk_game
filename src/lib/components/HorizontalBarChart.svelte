<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let { title, description, items = [], unit, color = '#3b82f6' } = $props();
	let canvas = $state();

	const titleId = $derived(`${title.replaceAll(' ', '-').toLowerCase()}-title`);

	onMount(() => {
		if (!canvas || items.length === 0) return;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: items.map((item) => item.label),
				datasets: [
					{
						data: items.map((item) => Number(item.value) || 0),
						backgroundColor: color,
						borderColor: color,
						borderWidth: 1,
						borderRadius: 6,
						borderSkipped: false,
						barThickness: 16
					}
				]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				animation: reduceMotion ? false : { duration: 650 },
				interaction: { mode: 'nearest', axis: 'y', intersect: false },
				plugins: {
					legend: { display: false },
					tooltip: {
						displayColors: false,
						callbacks: {
							label: (context) => `${context.parsed.x} ${unit}`
						}
					}
				},
				scales: {
					x: {
						beginAtZero: true,
						grid: { color: '#e2e8f0' },
						border: { display: false },
						ticks: { precision: 0, color: '#64748b', font: { size: 10 } }
					},
					y: {
						grid: { display: false },
						border: { display: false },
						ticks: { color: '#334155', font: { size: 11, weight: 600 } }
					}
				}
			}
		});

		return () => chart.destroy();
	});
</script>

<section class="panel min-w-0" aria-labelledby={titleId}>
	<div>
		<h2 id={titleId} class="text-base font-bold text-slate-900">{title}</h2>
		<p class="mt-1 text-xs leading-5 text-slate-500">{description}</p>
	</div>

	{#if items.length === 0}
		<p class="mt-6 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
			Belum ada data untuk ditampilkan.
		</p>
	{:else}
		<div class="relative mt-5 h-64" aria-hidden="true">
			<canvas bind:this={canvas}></canvas>
		</div>
		<ol class="sr-only">
			{#each items as item}
				<li>{item.label}: {item.value} {unit}</li>
			{/each}
		</ol>
	{/if}
</section>
