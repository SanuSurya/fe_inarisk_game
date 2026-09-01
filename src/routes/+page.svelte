<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Gamepad2, KeyRound } from '@lucide/svelte';
	import Swal from 'sweetalert2';
	import 'sweetalert2/dist/sweetalert2.min.css';
	import { adminApi, setAdminKey } from '$lib/api';

	let key = $state('');
	let loading = $state(false);
	let error = $state('');

	async function login(event) {
		event.preventDefault();
		loading = true;
		error = '';
		setAdminKey(key.trim());
		let countdownTimer;
		try {
			await adminApi.dashboard();
			await Swal.fire({
				icon: 'success',
				title: 'Selamat Datang!',
				html: `
					<div class="inarisk-swal-copy">
						<span class="inarisk-swal-badge">INARISK GAMES ADMIN</span>
						<p>Login berhasil. Dashboard aman sedang kami siapkan untuk Anda.</p>
						<div class="inarisk-swal-countdown">
							<span data-login-countdown>3</span>
							<small>detik menuju dashboard</small>
						</div>
					</div>`,
				timer: 3000,
				timerProgressBar: true,
				showConfirmButton: false,
				allowOutsideClick: false,
				allowEscapeKey: false,
				background: '#ffffff',
				color: '#0f172a',
				customClass: {
					container: 'inarisk-swal-container',
					popup: 'inarisk-login-swal',
					icon: 'inarisk-swal-icon',
					title: 'inarisk-swal-title',
					htmlContainer: 'inarisk-swal-html',
					timerProgressBar: 'inarisk-swal-progress'
				},
				didOpen: () => {
					const countdown = Swal.getHtmlContainer()?.querySelector('[data-login-countdown]');
					countdownTimer = window.setInterval(() => {
						if (countdown) {
							countdown.textContent = String(
								Math.max(1, Math.ceil((Swal.getTimerLeft() ?? 0) / 1000))
							);
						}
					}, 100);
				},
				willClose: () => window.clearInterval(countdownTimer)
			});
			await goto(`${base}/dashboard`);
		} catch (e) {
			error = e.message;
			setAdminKey('');
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#174d91,#081421_58%)] p-5"
>
	<form
		onsubmit={login}
		class="w-full max-w-md rounded-3xl border border-white/15 bg-white/95 p-8 shadow-2xl"
	>
		<div class="mb-7 flex items-center gap-4">
			<div class="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-900/20">
				<Gamepad2 size={32} aria-hidden="true" />
			</div>
			<div>
				<h1 class="text-2xl font-black">INARISK Games</h1>
				<p class="text-sm text-slate-500">Administrator Console</p>
			</div>
		</div>
		<label class="label" for="key">Admin API Key</label>
		<div class="relative">
			<KeyRound
				class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
				size={19}
				aria-hidden="true"
			/><input
				id="key"
				name="admin_api_key"
				class="field field-with-icon"
				type="password"
				autocomplete="current-password"
				spellcheck="false"
				bind:value={key}
				required
				placeholder="Masukkan API key admin"
			/>
		</div>
		{#if error}<p class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
				{error}
			</p>{/if}
		<button class="btn btn-primary mt-5 w-full" disabled={loading}
			>{loading ? 'Memeriksa…' : 'Masuk ke Dashboard'}</button
		>
		<p class="mt-5 text-center text-xs text-slate-400">
			Kredensial hanya disimpan pada session browser ini.
		</p>
	</form>
</div>

<style>
	:global(.inarisk-swal-container) {
		backdrop-filter: blur(8px);
		background: rgba(2, 12, 27, 0.72) !important;
	}

	:global(.inarisk-login-swal) {
		width: min(430px, calc(100vw - 32px));
		padding: 28px 28px 24px;
		border: 1px solid rgba(59, 130, 246, 0.22);
		border-radius: 28px;
		background:
			radial-gradient(circle at 50% -15%, rgba(59, 130, 246, 0.18), transparent 42%),
			linear-gradient(180deg, #ffffff 0%, #f8fbff 100%) !important;
		box-shadow:
			0 30px 80px rgba(2, 12, 27, 0.45),
			0 8px 24px rgba(37, 99, 235, 0.12);
		overflow: hidden;
	}

	:global(.inarisk-swal-icon) {
		margin-top: 4px;
		filter: drop-shadow(0 10px 14px rgba(16, 185, 129, 0.24));
	}

	:global(.inarisk-swal-title) {
		padding-top: 6px;
		font-size: 1.65rem;
		font-weight: 900;
		letter-spacing: -0.025em;
		color: #0f172a;
	}

	:global(.inarisk-swal-html) {
		margin-top: 8px;
	}

	:global(.inarisk-swal-copy) {
		display: grid;
		justify-items: center;
		gap: 14px;
		color: #475569;
		font-size: 0.92rem;
		line-height: 1.6;
	}

	:global(.inarisk-swal-copy p) {
		max-width: 330px;
		margin: 0;
	}

	:global(.inarisk-swal-badge) {
		display: inline-flex;
		align-items: center;
		min-height: 26px;
		padding: 4px 11px;
		border: 1px solid #bfdbfe;
		border-radius: 999px;
		background: #eff6ff;
		color: #2563eb;
		font-size: 0.67rem;
		font-weight: 900;
		letter-spacing: 0.12em;
	}

	:global(.inarisk-swal-countdown) {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 8px 13px 8px 9px;
		border-radius: 14px;
		background: #f1f5f9;
		color: #64748b;
	}

	:global(.inarisk-swal-countdown span) {
		display: grid;
		width: 30px;
		height: 30px;
		place-items: center;
		border-radius: 10px;
		background: #2563eb;
		color: white;
		font-variant-numeric: tabular-nums;
		font-weight: 900;
		box-shadow: 0 6px 14px rgba(37, 99, 235, 0.28);
	}

	:global(.inarisk-swal-countdown small) {
		font-size: 0.75rem;
		font-weight: 700;
	}

	:global(.inarisk-swal-progress) {
		height: 5px;
		background: linear-gradient(90deg, #2563eb, #06b6d4, #10b981) !important;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.inarisk-login-swal),
		:global(.inarisk-swal-icon) {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
