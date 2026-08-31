export const disasters = [
	['banjir', 'Banjir'],
	['banjir_bandang', 'Banjir Bandang'],
	['gempa_bumi', 'Gempa Bumi'],
	['letusan_gunung_api', 'Letusan Gunung Api'],
	['tanah_longsor', 'Tanah Longsor'],
	['tsunami', 'Tsunami']
];

export const difficulties = [
	['easy', 'Mudah'],
	['normal', 'Normal'],
	['hard', 'Sulit']
];

export const disasterName = (slug) => disasters.find(([id]) => id === slug)?.[1] || slug;
export const difficultyName = (id) => difficulties.find(([key]) => key === id)?.[1] || id;
export const formatDate = (value) =>
	value
		? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(
				new Date(value)
			)
		: '-';
