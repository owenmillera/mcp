import directusConfig from '@directus/eslint-config';

export default [
	...directusConfig,
	{
		rules: {
			'n/prefer-global/process': 'off',
		},
	},
];
