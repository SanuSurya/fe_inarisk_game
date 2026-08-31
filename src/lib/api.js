import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

export const apiBase = (
	env.PUBLIC_API_URL || 'https://inarisk2.bnpb.go.id/inarisk-games-api'
).replace(/\/+$/, '');

export function getAdminKey() {
	return browser ? sessionStorage.getItem('inarisk_games_admin_key') || '' : '';
}

export function setAdminKey(value) {
	if (browser) sessionStorage.setItem('inarisk_games_admin_key', value);
}

export function clearAdminKey() {
	if (browser) sessionStorage.removeItem('inarisk_games_admin_key');
}

export async function api(path, options = {}) {
	const headers = new Headers(options.headers || {});
	headers.set('Accept', 'application/json');
	const key = getAdminKey();
	if (key) headers.set('Authorization', `Bearer ${key}`);
	if (options.body && !(options.body instanceof FormData))
		headers.set('Content-Type', 'application/json');
	const response = await fetch(`${apiBase}${path}`, { ...options, headers });
	if (!response.ok) {
		const payload = await response.json().catch(() => ({}));
		throw new Error(payload.error || `HTTP ${response.status}`);
	}
	return response.status === 204 ? null : response.json();
}

export const adminApi = {
	dashboard: () => api('/api/v1/admin/dashboard'),
	questions: (filters = {}) => api(`/api/v1/admin/questions?${new URLSearchParams(filters)}`),
	createQuestion: (data) =>
		api('/api/v1/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
	updateQuestion: (id, data) =>
		api(`/api/v1/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
	deleteQuestion: (id) => api(`/api/v1/admin/questions/${id}`, { method: 'DELETE' }),
	difficulties: () => api('/api/v1/admin/difficulties'),
	updateDifficulty: (id, data) =>
		api(`/api/v1/admin/difficulties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
	players: () => api('/api/v1/admin/players'),
	deletePlayer: (id) => api(`/api/v1/admin/players/${id}`, { method: 'DELETE' }),
	logs: () => api('/api/v1/admin/logs?limit=500'),
	quizDuels: () => api('/api/v1/admin/duels/quiz'),
	adventureDuels: () => api('/api/v1/admin/duels/adventure'),
	leaderboard: (filters = {}) =>
		api(`/api/v1/leaderboard?${new URLSearchParams({ ...filters, limit: '100' })}`)
};
