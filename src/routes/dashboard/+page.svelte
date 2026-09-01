<script>
	import { onMount, tick } from 'svelte';
	import {
		Users,
		CircleHelp,
		BrainCircuit,
		Gamepad2,
		Radio,
		Trophy,
		Sparkles,
		Play,
		Info,
		X
	} from '@lucide/svelte';
	import { driver } from 'driver.js';
	import 'driver.js/dist/driver.css';
	import AdminShell from '$lib/components/AdminShell.svelte';
	import HorizontalBarChart from '$lib/components/HorizontalBarChart.svelte';
	import Status from '$lib/components/Status.svelte';
	import { adminApi } from '$lib/api';

	let data = $state(null);
	let error = $state('');
	let loading = $state(true);
	let showAdminInfo = $state(true);
	const tourStorageKey = 'inarisk_games_dashboard_tour_v1';

	function startTour() {
		const steps = [
			{
				element: '#dashboard-intro',
				popover: {
					title: 'Selamat Datang di Dashboard',
					description: 'Pantau seluruh aktivitas INARISK Games dari satu halaman.',
					side: 'bottom',
					align: 'start'
				}
			},
			{
				element: '#dashboard-stats',
				popover: {
					title: 'Ringkasan Utama',
					description: 'Lihat jumlah pemain, soal, sesi Quiz, Adventure, dan skor terbaik.',
					side: 'bottom',
					align: 'center'
				}
			},
			{
				element: '#dashboard-charts',
				popover: {
					title: 'Analitik Pemain',
					description: 'Bandingkan pemain aktif, skor tertinggi, dan juara multiplayer.',
					side: 'top',
					align: 'center'
				}
			}
		];

		if (window.matchMedia('(min-width: 1024px)').matches) {
			steps.push({
				element: '[data-tour="admin-navigation"]',
				popover: {
					title: 'Navigasi Administrator',
					description: 'Buka pengelolaan soal, pemain, log, hasil duel, dan peringkat dari sini.',
					side: 'right',
					align: 'start'
				}
			});
		}

		const tour = driver({
			popoverClass: 'inarisk-tour-popover',
			showProgress: true,
			allowClose: true,
			nextBtnText: 'Lanjut',
			prevBtnText: 'Kembali',
			doneBtnText: 'Selesai',
			progressText: 'Langkah {{current}} dari {{total}}',
			steps,
			onDestroyed: () => localStorage.setItem(tourStorageKey, 'seen')
		});
		tour.drive();
	}

	onMount(async () => {
		try {
			data = await adminApi.dashboard();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
			await tick();
			if (!error && localStorage.getItem(tourStorageKey) !== 'seen') {
				window.setTimeout(startTour, 600);
			}
		}
	});
	const cards = $derived(
		data
			? [
					['Total Pemain', data.players, Users, 'text-blue-600 bg-blue-50'],
					['Soal Aktif', data.active_questions, CircleHelp, 'text-emerald-600 bg-emerald-50'],
					['Quiz Dimainkan', data.quiz_attempts, BrainCircuit, 'text-orange-600 bg-orange-50'],
					[
						'Adventure Dimainkan',
						data.adventure_sessions,
						Gamepad2,
						'text-violet-600 bg-violet-50',
						`dari ${data.adventure_players ?? 0} pemain`
					],
					['Adventure Berlangsung', data.active_adventure_duels, Radio, 'text-rose-600 bg-rose-50'],
					['Skor Quiz Terbaik', data.best_quiz_score, Trophy, 'text-amber-600 bg-amber-50']
				]
			: []
	);
</script>

<AdminShell title="Dashboard">
	{#if loading || error}<Status {loading} {error} />{:else}
		<section
			id="dashboard-intro"
			class="dashboard-intro relative mb-6 overflow-hidden rounded-3xl bg-[linear-gradient(125deg,#0f3f82,#1565c0_58%,#0891b2)] px-5 py-6 text-white shadow-xl shadow-blue-950/15 sm:px-8 sm:py-8"
		>
			<div
				class="pointer-events-none absolute -top-20 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-300/15 blur-3xl"
			></div>
			<div class="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
				<div class="flex max-w-2xl items-start gap-4">
					<div class="rounded-2xl border border-white/20 bg-white/12 p-3 shadow-lg backdrop-blur">
						<Sparkles size={27} aria-hidden="true" />
					</div>
					<div>
						<p class="text-xs font-bold tracking-[0.18em] text-blue-100 uppercase">
							Command Center
						</p>
						<h2 class="mt-1 text-2xl font-black sm:text-3xl">Selamat datang di INARISK Games</h2>
						<p class="mt-2 text-sm leading-6 text-blue-50/90 sm:text-base">
							Pantau perkembangan pemain, kualitas materi, dan performa multiplayer dalam satu
							dashboard yang terintegrasi.
						</p>
					</div>
				</div>
				<button
					type="button"
					class="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white px-4 py-2.5 text-sm font-bold text-blue-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
					onclick={startTour}
				>
					<Play size={17} fill="currentColor" aria-hidden="true" /> Mulai Tur
				</button>
			</div>
		</section>

		<div id="dashboard-stats" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{#each cards as [label, value, Icon, color, detail]}<div
					class="panel flex items-center gap-4"
				>
					<div class="rounded-xl p-3 {color}"><Icon size={25} aria-hidden="true" /></div>
					<div class="min-w-0">
						<p class="numeric text-2xl font-black text-slate-900">{value}</p>
						<p class="text-xs text-slate-500">{label}</p>
						{#if detail}<p class="mt-0.5 text-xs font-semibold text-slate-700">{detail}</p>{/if}
					</div>
				</div>{/each}
		</div>
		<div id="dashboard-charts" class="mt-6 grid gap-5 xl:grid-cols-3">
			<HorizontalBarChart
				title="Pemain Paling Aktif"
				description="Berdasarkan total sesi Quiz, Adventure, dan hasil duel yang tercatat."
				items={data.charts?.active_players ?? []}
				unit="aktivitas"
				color="#3b82f6"
			/>
			<HorizontalBarChart
				title="Skor Quiz Tertinggi"
				description="Akumulasi skor terbaik pemain pada setiap materi dan tingkat kesulitan."
				items={data.charts?.top_scores ?? []}
				unit="poin"
				color="#f59e0b"
			/>
			<HorizontalBarChart
				title="Juara Multiplayer"
				description="Pemain dengan kemenangan terbanyak dari duel Quiz dan Adventure."
				items={data.charts?.multiplayer_winners ?? []}
				unit="menang"
				color="#10b981"
			/>
		</div>
		{#if showAdminInfo}
			<div
				class="dashboard-info-toast fixed right-4 bottom-4 left-4 z-30 flex items-start gap-3 rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur sm:left-auto sm:max-w-md"
				role="status"
				aria-live="polite"
			>
				<div class="shrink-0 rounded-xl bg-blue-50 p-2.5 text-blue-600">
					<Info size={21} aria-hidden="true" />
				</div>
				<div class="min-w-0 flex-1">
					<h2 class="text-sm font-bold text-slate-900">Administrasi Game</h2>
					<p class="mt-1 text-xs leading-5 text-slate-600">
						Kelola bank soal dan tingkat kesulitan, pantau pemain, audit log permainan, serta lihat
						peringkat Quiz dari satu panel.
					</p>
				</div>
				<button
					type="button"
					class="-mt-1 -mr-1 shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
					aria-label="Tutup informasi administrasi game"
					onclick={() => (showAdminInfo = false)}
				>
					<X size={18} aria-hidden="true" />
				</button>
			</div>
		{/if}
	{/if}
</AdminShell>

<style>
	.dashboard-intro {
		animation: dashboard-intro-in 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.dashboard-info-toast {
		animation: dashboard-toast-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@keyframes dashboard-intro-in {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.99);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes dashboard-toast-in {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	:global(.inarisk-tour-popover) {
		max-width: 360px;
		border: 1px solid #dbeafe;
		border-radius: 18px;
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
	}

	:global(.inarisk-tour-popover .driver-popover-title) {
		font-size: 1rem;
		font-weight: 900;
		color: #0f172a;
	}

	:global(.inarisk-tour-popover .driver-popover-description) {
		line-height: 1.6;
		color: #475569;
	}

	:global(.inarisk-tour-popover .driver-popover-next-btn),
	:global(.inarisk-tour-popover .driver-popover-done-btn) {
		border: 0;
		border-radius: 9px;
		background: #2563eb;
		color: white;
		text-shadow: none;
	}

	:global(.inarisk-tour-popover .driver-popover-prev-btn) {
		border-radius: 9px;
		background: white;
		color: #475569;
		text-shadow: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.dashboard-intro,
		.dashboard-info-toast {
			animation: none;
		}
	}
</style>
