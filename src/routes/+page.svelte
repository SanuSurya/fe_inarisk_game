<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { Gamepad2, KeyRound } from '@lucide/svelte';
	import { adminApi, setAdminKey } from '$lib/api';

	let key = $state('');
	let loading = $state(false);
	let error = $state('');

	async function login(event) {
		event.preventDefault();
		loading = true;
		error = '';
		setAdminKey(key.trim());
		try {
			await adminApi.dashboard();
			goto(`${base}/dashboard`);
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
